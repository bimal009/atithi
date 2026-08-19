// seeddishes bulk-populates the shared, global dishes catalog from a CSV of
// dish names and image URLs. It re-hosts each dish photo on ImageKit (never
// linking to the original source) and writes a CSV record of what got
// uploaded.
//
// The source CSV can use either "name"/"image_url" columns (the curated
// Nepali food database) or "menuItemName"/"menuItemImageUrl" columns (a raw
// restaurant menu export), in which case a cuisine filter using
// restaurantName/restaurantDescription is also applied.
//
// Usage: go run ./cmd/seeddishes -csv data/nepali_food_database_1.csv
package main

import (
	"context"
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/bimal009/atithi/config"
	"github.com/bimal009/atithi/internal/menuitems"
	"github.com/bimal009/atithi/pkg/db"
	"github.com/bimal009/atithi/pkg/logger"
	"github.com/joho/godotenv"

	imagekit "github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
	"github.com/imagekit-developer/imagekit-go/v2/packages/param"
)

type sourceRow struct {
	name     string
	imageURL string
}

// southAsianRestaurantKeywords match restaurantName/restaurantDescription for
// restaurants we treat as South Asian, per the "keep south asian foods" scope.
var southAsianRestaurantKeywords = []string{
	"indian", "tex-in", "samosa", "tandoori", "biryani",
	"nepal", "pakistan", "bangladesh", "south asian", "curry",
}

// excludedCuisineKeywords match restaurantName/restaurantDescription for
// restaurants we exclude even though they are not South Asian, so a dish
// from a clearly non-global, non-South-Asian cuisine never slips in.
var excludedCuisineKeywords = []string{
	"chinese", "china", "dumpling", "szechuan", "sichuan", "wok",
	"vietnamese", "pho", "banh mi",
	"japanese", "sushi", "ramen", "teriyaki", "izakaya", "poke",
	"korean", "bbq korean",
	"thai",
}

// globalGenericDishKeywords match menuItemName for universally recognized
// generic drinks and snacks that are the same everywhere, independent of the
// restaurant's cuisine, e.g. Coke, Fanta.
var globalGenericDishKeywords = []string{
	"coke", "coca-cola", "coca cola", "pepsi", "fanta", "sprite",
	"mountain dew", "dr pepper", "dr. pepper", "7up", "7-up",
	"sparkling water", "still water", "mineral water", "bottled water",
	"lemonade", "iced tea", "soda",
}

func containsAny(haystack string, needles []string) bool {
	lower := strings.ToLower(haystack)
	for _, n := range needles {
		if strings.Contains(lower, n) {
			return true
		}
	}
	return false
}

// includeRow decides whether a dish belongs in the seeded catalog: either it
// is a universally recognized generic item, or it comes from a restaurant we
// treat as South Asian and not from a restaurant in an excluded cuisine.
func includeRow(dishName, restaurantName, restaurantDescription string) bool {
	if containsAny(dishName, globalGenericDishKeywords) {
		return true
	}

	restaurantText := restaurantName + " " + restaurantDescription
	if containsAny(restaurantText, excludedCuisineKeywords) {
		return false
	}

	return containsAny(restaurantText, southAsianRestaurantKeywords)
}

func main() {
	csvPath := flag.String("csv", "data/nepali_food_database_1.csv", "path to the source CSV")
	mergePath := flag.String("merge-csv", "data/uploaded_dishes.csv", "path to a prior uploaded-dish report to merge in; a dish already hosted on ImageKit there is reused instead of re-uploaded")
	outPath := flag.String("out", "data/uploaded_dishes.csv", "path to write the uploaded-dish CSV report to")
	clean := flag.Bool("clean", true, "truncate dishes and menu_items before seeding")
	flag.Parse()

	ctx := context.Background()

	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on environment variables")
	}

	cfg := config.MustLoad()
	slog := logger.New(cfg.App.Env)

	pool, err := db.ConnectDB(ctx, cfg.DB.URL, slog)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	if *clean {
		if _, err := pool.Exec(ctx, "TRUNCATE TABLE menu_items, dishes"); err != nil {
			log.Fatalf("failed to clean dishes/menu_items: %v", err)
		}
		fmt.Println("cleaned dishes and menu_items")
	}

	rows, err := readSourceRows(*csvPath)
	if err != nil {
		log.Fatalf("failed to read source csv: %v", err)
	}
	fmt.Printf("found %d unique dishes (%d with a source photo)\n", len(rows), countWithImage(rows))

	if *mergePath != "" && *mergePath != *csvPath {
		merged, err := mergeAlreadyUploaded(rows, *mergePath)
		if err != nil {
			log.Printf("no prior report to merge from %s: %v", *mergePath, err)
		} else {
			rows = merged
		}
	}

	repo := menuitems.NewMenuItemRepo(pool)
	ikClient := imagekit.NewClient(option.WithPrivateKey(cfg.ImageKit.PrivateKey))
	httpClient := &http.Client{Timeout: 20 * time.Second}

	outFile, err := os.Create(*outPath)
	if err != nil {
		log.Fatalf("failed to create output csv: %v", err)
	}
	defer outFile.Close()

	writer := csv.NewWriter(outFile)
	defer writer.Flush()
	if err := writer.Write([]string{"name", "image_url"}); err != nil {
		log.Fatalf("failed to write csv header: %v", err)
	}

	reused, uploaded, skipped, failed := 0, 0, 0, 0

	for i, row := range rows {
		var imageURL *string

		switch {
		case row.imageURL == "":
			skipped++
		case isImageKitURL(row.imageURL):
			url := row.imageURL
			imageURL = &url
			reused++
			if err := writer.Write([]string{row.name, url}); err != nil {
				log.Fatalf("failed to write csv row: %v", err)
			}
			writer.Flush()
		default:
			url, err := uploadDishPhoto(ctx, httpClient, ikClient, row.name, row.imageURL)
			if err != nil {
				fmt.Printf("[%d/%d] %-40s failed to upload photo: %v\n", i+1, len(rows), row.name, err)
				failed++
			} else {
				imageURL = &url
				uploaded++
				if err := writer.Write([]string{row.name, url}); err != nil {
					log.Fatalf("failed to write csv row: %v", err)
				}
				writer.Flush()
			}
		}

		if _, err := repo.FindOrCreateDish(ctx, row.name, imageURL); err != nil {
			fmt.Printf("[%d/%d] %-40s failed to save dish: %v\n", i+1, len(rows), row.name, err)
			continue
		}

		fmt.Printf("[%d/%d] %s\n", i+1, len(rows), row.name)
	}

	fmt.Printf("\ndone: %d already on ImageKit (reused), %d newly uploaded, %d without a source photo, %d photo uploads failed\n", reused, uploaded, skipped, failed)
	fmt.Printf("report written to %s\n", *outPath)
}

// isImageKitURL reports whether a URL already points at our ImageKit account,
// meaning it never needs to be re-downloaded and re-uploaded.
func isImageKitURL(url string) bool {
	return strings.Contains(url, "imagekit.io")
}

// mergeAlreadyUploaded overlays image URLs from a prior uploaded-dish report
// onto rows, so a dish already hosted on ImageKit is reused instead of
// re-uploaded on this run.
func mergeAlreadyUploaded(rows []sourceRow, reportPath string) ([]sourceRow, error) {
	report, err := readSourceRows(reportPath)
	if err != nil {
		return nil, err
	}

	byName := map[string]string{}
	for _, r := range report {
		if isImageKitURL(r.imageURL) {
			byName[strings.ToLower(r.name)] = r.imageURL
		}
	}

	merged := make([]sourceRow, len(rows))
	copy(merged, rows)
	for i, row := range merged {
		if url, ok := byName[strings.ToLower(row.name)]; ok {
			merged[i].imageURL = url
		}
	}
	return merged, nil
}

// readSourceRows parses the CSV and dedupes by lowercased dish name, keeping
// the first row that has an image if any duplicate does.
func readSourceRows(path string) ([]sourceRow, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	r := csv.NewReader(f)
	r.LazyQuotes = true
	r.FieldsPerRecord = -1

	header, err := r.Read()
	if err != nil {
		return nil, err
	}
	header[0] = strings.TrimPrefix(header[0], string([]byte{0xEF, 0xBB, 0xBF}))
	idx := map[string]int{}
	for i, h := range header {
		idx[h] = i
	}

	nameCol, imageCol, hasNameCol := "name", "image_url", true
	applyCuisineFilter := false
	if _, ok := idx["menuItemName"]; ok {
		nameCol, imageCol = "menuItemName", "menuItemImageUrl"
		applyCuisineFilter = true
	} else if _, ok := idx["name"]; !ok {
		hasNameCol = false
	}
	if !hasNameCol {
		return nil, fmt.Errorf("csv has neither a %q nor a %q column", "name", "menuItemName")
	}

	byName := map[string]sourceRow{}
	var order []string

	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}
		if idx[nameCol] >= len(record) || idx[imageCol] >= len(record) {
			continue
		}

		name := strings.TrimSpace(record[idx[nameCol]])
		if name == "" {
			continue
		}

		if applyCuisineFilter {
			restaurantName := ""
			restaurantDescription := ""
			if i, ok := idx["restaurantName"]; ok && i < len(record) {
				restaurantName = strings.TrimSpace(record[i])
			}
			if i, ok := idx["restaurantDescription"]; ok && i < len(record) {
				restaurantDescription = strings.TrimSpace(record[i])
			}
			if !includeRow(name, restaurantName, restaurantDescription) {
				continue
			}
		}

		key := strings.ToLower(name)
		imageURL := strings.TrimSpace(record[idx[imageCol]])

		existing, ok := byName[key]
		if !ok {
			byName[key] = sourceRow{name: name, imageURL: imageURL}
			order = append(order, key)
			continue
		}
		if existing.imageURL == "" && imageURL != "" {
			existing.imageURL = imageURL
			byName[key] = existing
		}
	}

	rows := make([]sourceRow, 0, len(order))
	for _, key := range order {
		rows = append(rows, byName[key])
	}
	return rows, nil
}

func countWithImage(rows []sourceRow) int {
	n := 0
	for _, r := range rows {
		if r.imageURL != "" {
			n++
		}
	}
	return n
}

var unsafeFileNameChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func sanitizeFileName(name string) string {
	cleaned := unsafeFileNameChars.ReplaceAllString(name, "_")
	if cleaned == "" {
		cleaned = "dish"
	}
	return cleaned + ".jpg"
}

// uploadDishPhoto downloads the source image and re-uploads it to ImageKit,
// returning our own hosted URL. We never store the original source URL.
func uploadDishPhoto(ctx context.Context, httpClient *http.Client, ikClient imagekit.Client, name, sourceURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, sourceURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "Atithi-DishCatalog/1.0 (https://github.com/bimal009/atithi; internal data enrichment tool for a hotel menu catalog)")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("source image returned status %d", resp.StatusCode)
	}

	uploaded, err := ikClient.Files.Upload(ctx, imagekit.FileUploadParams{
		File:     resp.Body,
		FileName: sanitizeFileName(name),
		Folder:   param.NewOpt("/dishes-seed"),
	})
	if err != nil {
		return "", err
	}

	return uploaded.URL, nil
}

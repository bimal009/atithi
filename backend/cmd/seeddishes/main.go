// seeddishes bulk-populates the shared, global dishes catalog from a CSV
// export of real restaurant menu data. It re-hosts each dish photo on
// ImageKit (never linking to the original source) and writes a CSV record
// of what got uploaded.
//
// Usage: go run ./cmd/seeddishes -csv data/restaurantmenuchanges.csv
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
	csvPath := flag.String("csv", "data/restaurantmenuchanges.csv", "path to the source CSV")
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

	ikClient := imagekit.NewClient(option.WithPrivateKey(cfg.ImageKit.PrivateKey))
	repo := menuitems.NewMenuItemRepo(pool)

	httpClient := &http.Client{Timeout: 20 * time.Second}

	outFile, err := os.Create(*outPath)
	if err != nil {
		log.Fatalf("failed to create output csv: %v", err)
	}
	defer outFile.Close()

	writer := csv.NewWriter(outFile)
	defer writer.Flush()
	if err := writer.Write([]string{"name", "imagekit_url"}); err != nil {
		log.Fatalf("failed to write csv header: %v", err)
	}

	uploaded, skipped, failed := 0, 0, 0

	for i, row := range rows {
		var imageURL *string

		if row.imageURL != "" {
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
		} else {
			skipped++
		}

		if _, err := repo.FindOrCreateDish(ctx, row.name, imageURL); err != nil {
			fmt.Printf("[%d/%d] %-40s failed to save dish: %v\n", i+1, len(rows), row.name, err)
			continue
		}

		fmt.Printf("[%d/%d] %s\n", i+1, len(rows), row.name)
	}

	fmt.Printf("\ndone: %d dishes with photos uploaded, %d without a source photo, %d photo uploads failed\n", uploaded, skipped, failed)
	fmt.Printf("report written to %s\n", *outPath)
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
	idx := map[string]int{}
	for i, h := range header {
		idx[h] = i
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
		if idx["menuItemName"] >= len(record) || idx["restaurantName"] >= len(record) || idx["restaurantDescription"] >= len(record) || idx["menuItemImageUrl"] >= len(record) {
			continue
		}

		name := strings.TrimSpace(record[idx["menuItemName"]])
		if name == "" {
			continue
		}

		restaurantName := strings.TrimSpace(record[idx["restaurantName"]])
		restaurantDescription := strings.TrimSpace(record[idx["restaurantDescription"]])
		if !includeRow(name, restaurantName, restaurantDescription) {
			continue
		}

		key := strings.ToLower(name)
		imageURL := strings.TrimSpace(record[idx["menuItemImageUrl"]])

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

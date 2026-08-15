package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
)

func GenerateVerificationToken() (string, error) {
	return randomHex(32)
}

func GenerateSessionToken() (string, error) {
	return randomHex(32)
}

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func GenerateOTP(digits int) (string, error) {
	max := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(digits)), nil)

	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%0*d", digits, n), nil
}

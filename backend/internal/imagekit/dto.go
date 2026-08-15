package handlers

// ImageAuthTokenResponse is the short-lived credential the browser needs to
// upload straight to ImageKit. PublicKey and URLEndpoint ride along so the
// frontend does not have to keep its own copy of them in sync.
type ImageAuthTokenResponse struct {
	Signature   string `json:"signature"`
	Expire      int64  `json:"expire"`
	Token       string `json:"token"`
	PublicKey   string `json:"publicKey"`
	URLEndpoint string `json:"urlEndpoint"`
}

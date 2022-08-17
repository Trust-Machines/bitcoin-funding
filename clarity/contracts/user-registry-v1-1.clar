
;; 
;; Constants
;; 

(define-constant ERR_BTC_EXISTS (err u30001))

;; 
;; Maps
;; 

(define-map btc-to-stx (buff 33) principal)
(define-map stx-to-btc principal (buff 33))

;; 
;; Getters
;; 

(define-read-only (get-btc-to-stx (public-key (buff 33)))
  (map-get? btc-to-stx public-key)
)

(define-read-only (get-stx-to-btc (address principal))
  (map-get? stx-to-btc address)
)

(define-read-only (is-btc-registered (public-key (buff 33)))
  (not (is-none (map-get? btc-to-stx public-key)))
)

(define-read-only (is-stx-registered (address principal))
  (not (is-none (map-get? stx-to-btc address)))
)

;; 
;; Register
;; 

(define-public (register-user (public-key (buff 33)))
  (begin
    (asserts! (map-insert btc-to-stx public-key tx-sender) ERR_BTC_EXISTS)
    (map-set stx-to-btc tx-sender public-key)    
    (ok true)
  )
)

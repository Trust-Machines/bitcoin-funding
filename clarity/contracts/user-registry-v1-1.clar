
;; 
;; Constants
;; 

(define-constant ERR_USER_EXISTS (err u30001))

;; 
;; Maps
;; 

(define-map btc-to-stx (buff 33) principal)

;; 
;; Getters
;; 

(define-read-only (get-btc-to-stx (public-key (buff 33)))
  (map-get? btc-to-stx public-key)
)

;; 
;; Register
;; 

(define-public (register-user (public-key (buff 33)))
  (begin
    (asserts! (map-insert btc-to-stx public-key tx-sender) ERR_USER_EXISTS)
    (ok true)
  )
)

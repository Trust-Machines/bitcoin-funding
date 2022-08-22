
;; 
;; Constants
;; 

(define-constant ERR_DAO_EXISTS (err u10001))

;; 
;; Vars
;; 

(define-data-var dao-count uint u0)

;; 
;; Maps
;; 

(define-map dao-by-id uint {
  address: (buff 33),   ;; address before encoding
  admin: principal
})

(define-map dao-id-by-address (buff 33) uint)

;; 
;; Getters
;; 

(define-read-only (get-dao-count)
  (ok (var-get dao-count))
)

(define-read-only (get-dao-by-id (dao-id uint))
  (ok (map-get? dao-by-id dao-id))
)

(define-read-only (get-dao-id-by-address (address (buff 33)))
  (ok (map-get? dao-id-by-address address))
)

(define-read-only (is-dao-registered (address (buff 33)))
  (ok (not (is-none (map-get? dao-id-by-address address))))
)

;; 
;; Register
;; 

(define-public (register-dao (address (buff 33)))
  (let (
    (dao-id (var-get dao-count))
  )
    (asserts! (map-insert dao-id-by-address address dao-id) ERR_DAO_EXISTS)

    (map-set dao-by-id dao-id {
      address: address,
      admin: tx-sender
    })

    (var-set dao-count (+ dao-id u1))
    (ok dao-id)
  )
)

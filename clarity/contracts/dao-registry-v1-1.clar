
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
  public-key: (buff 33),
  admin: principal
})

(define-map dao-id-by-public-key (buff 33) uint)

;; 
;; Getters
;; 

(define-read-only (get-dao-count)
  (var-get dao-count)
)

(define-read-only (get-dao-by-id (dao-id uint))
  (map-get? dao-by-id dao-id)
)

(define-read-only (get-dao-id-by-public-key (public-key (buff 33)))
  (map-get? dao-id-by-public-key public-key)
)

;; 
;; Register
;; 

(define-public (register-dao (public-key (buff 33)))
  (let (
    (dao-id (var-get dao-count))
  )
    (asserts! (map-insert dao-id-by-public-key public-key dao-id) ERR_DAO_EXISTS)

    (map-set dao-by-id dao-id {
      public-key: public-key,
      admin: tx-sender
    })

    (var-set dao-count (+ dao-id u1))
    (ok dao-id)
  )
)

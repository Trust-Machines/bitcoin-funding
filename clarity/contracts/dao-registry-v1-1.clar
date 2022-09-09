(impl-trait .dao-registry-trait-v1-1.dao-registry-trait)

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

;; Address is not encoded
(define-map dao-address-by-id uint (buff 33))
(define-map dao-id-by-address (buff 33) uint)

;; 
;; Getters
;; 

(define-read-only (get-dao-count)
  (ok (var-get dao-count))
)

(define-read-only (get-dao-address-by-id (dao-id uint))
  (ok (map-get? dao-address-by-id dao-id))
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
    (try! (contract-call? .main check-is-enabled))
    (asserts! (map-insert dao-id-by-address address dao-id) ERR_DAO_EXISTS)

    (map-set dao-address-by-id dao-id address)
    (var-set dao-count (+ dao-id u1))
    (ok dao-id)
  )
)


;; 
;; Constants
;; 

(define-constant ERR_DAO_NOT_FOUND (err u20001))
(define-constant ERR_INVALID_TX (err u20002))

;; 
;; Maps
;; 

(define-map user-dao-funding 
  {
    dao-id: uint,
    user-public-key: (buff 33)
  } {
    amount: uint
  }
)

(define-map total-dao-funding uint uint)

;; 
;; Getters
;; 

(define-read-only (get-user-dao-funding (dao-id uint) (user-public-key (buff 33)))
  (map-get? user-dao-funding { dao-id: dao-id, user-public-key: user-public-key })
)

(define-read-only (get-total-dao-funding (dao-id uint))
  (map-get? total-dao-funding dao-id)
)

;; 
;; Register
;; 

(define-read-only (parse-tx 
  (tx (buff 1024))
  (output-index uint)
)
  (let (
    ;; TODO - Update mainnet address
    (parsed-tx (unwrap! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin parse-tx tx) ERR_INVALID_TX))
    ;; (input (unwrap! (element-at (get ins parsed-tx) parse-index) ERR_INVALID_TX))
    (output (unwrap! (element-at (get outs parsed-tx) output-index) ERR_INVALID_TX))
  )
    (ok {
      receiver: (get scriptPubKey output),
      sats: (get value output)
    })
  )
)

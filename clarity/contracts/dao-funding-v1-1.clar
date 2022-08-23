(use-trait dao-registry-trait .dao-registry-trait-v1-1.dao-registry-trait)

;; 
;; Constants
;; 

(define-constant ERR_DAO_NOT_FOUND (err u20001))
(define-constant ERR_INVALID_TX (err u20002))
(define-constant ERR_TX_NOT_MINED (err u20003))
(define-constant ERR_WRONG_SENDER (err u20004))
(define-constant ERR_WRONG_RECEIVER (err u20005))
(define-constant ERR_TX_ALREADY_ADDED (err u20006))

;; 
;; Maps
;; 

(define-map user-dao-funding 
  {
    dao-id: uint,
    user-address: (buff 33)   ;; address before encoding
  } 
  uint
)

(define-map total-dao-funding uint uint)

(define-map tx-parsed (buff 1024) bool)

;; 
;; Getters
;; 

(define-read-only (get-user-dao-funding (dao-id uint) (user-address (buff 33)))
  (default-to 
    u0
    (map-get? user-dao-funding { dao-id: dao-id, user-address: user-address })
  )
)

(define-read-only (get-total-dao-funding (dao-id uint))
  (default-to 
    u0
    (map-get? total-dao-funding dao-id)
  )
)

(define-read-only (get-tx-parsed (tx (buff 1024)))
  (default-to 
    false
    (map-get? tx-parsed tx)
  )
)

;; 
;; Parse
;; 

(define-public (add-user-funding
  (dao-registry <dao-registry-trait>)
  (block { header: (buff 80), height: uint })
  (prev-blocks (list 10 (buff 80)))
  (tx (buff 1024))
  (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  (sender-index uint)
  (receiver-index uint)
  (sender-address (buff 33))
  (receiver-address (buff 33))
)
  (let (
    (sats (try! (parse-and-validate-tx block prev-blocks tx proof sender-index receiver-index sender-address receiver-address)))
    (dao-id (unwrap! (unwrap! (contract-call? dao-registry get-dao-id-by-address receiver-address) ERR_DAO_NOT_FOUND) ERR_DAO_NOT_FOUND))

    (current-total (get-total-dao-funding dao-id))
    (current-user-total (get-user-dao-funding dao-id sender-address))
  )
    (asserts! (not (get-tx-parsed tx)) ERR_TX_ALREADY_ADDED)

    (map-set total-dao-funding dao-id (+ current-total sats))
    (map-set user-dao-funding { dao-id: dao-id, user-address: sender-address } (+ current-user-total sats))
    (map-set tx-parsed tx true)
    (ok sats)
  )
)

(define-read-only (parse-and-validate-tx 
  (block { header: (buff 80), height: uint })
  (prev-blocks (list 10 (buff 80)))
  (tx (buff 1024))
  (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  (sender-index uint)
  (receiver-index uint)
  (sender-address (buff 33))
  (receiver-address (buff 33))
)
  (let (
    ;; TODO - Update mainnet address
    (was-mined (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin was-tx-mined-prev? block prev-blocks tx proof)))
    (parsed-tx (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin parse-tx tx)))

    (sender (unwrap! (element-at (get outs parsed-tx) sender-index) ERR_INVALID_TX))
    (receiver (unwrap! (element-at (get outs parsed-tx) receiver-index) ERR_INVALID_TX))
  )
    (asserts! was-mined ERR_TX_NOT_MINED)
    (asserts! (is-eq sender-address (get scriptPubKey sender)) ERR_WRONG_SENDER)
    (asserts! (is-eq receiver-address (get scriptPubKey receiver)) ERR_WRONG_RECEIVER)

    (ok (get value receiver))
  )
)

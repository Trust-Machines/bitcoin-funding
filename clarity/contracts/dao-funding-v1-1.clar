
;; 
;; Constants
;; 

(define-constant ERR_DAO_NOT_FOUND (err u20001))
(define-constant ERR_INVALID_TX (err u20002))
(define-constant ERR_TX_NOT_MINED (err u20003))
(define-constant ERR_WRONG_SENDER (err u20004))
(define-constant ERR_WRONG_RECEIVER (err u20005))

;; 
;; Maps
;; 

(define-map user-dao-funding 
  {
    dao-id: uint,
    user-public-key: (buff 33)
  } 
  uint
)

(define-map total-dao-funding uint uint)

;; 
;; Getters
;; 

(define-read-only (get-user-dao-funding (dao-id uint) (user-public-key (buff 33)))
  (default-to 
    u0
    (map-get? user-dao-funding { dao-id: dao-id, user-public-key: user-public-key })
  )
)

(define-read-only (get-total-dao-funding (dao-id uint))
  (default-to 
    u0
    (map-get? total-dao-funding dao-id)
  )
)

;; 
;; Parse
;; 

(define-public (add-user-funding
  (block { header: (buff 80), height: uint })
  (prev-blocks (list 10 (buff 80)))
  (tx (buff 1024))
  (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  (sender-index uint)
  (receiver-index uint)
  (sender-public-key (buff 33))
  (receiver-public-key (buff 33))
)
  (let (
    (sats (try! (parse-and-validate-tx block prev-blocks tx proof sender-index receiver-index sender-public-key receiver-public-key)))

    ;; TODO - make registry dynamic
    (dao-id (unwrap! (contract-call? .dao-registry-v1-1 get-dao-id-by-public-key receiver-public-key) ERR_DAO_NOT_FOUND))

    (current-total (get-total-dao-funding dao-id))
  )

    ;; TODO - save info

    (map-set total-dao-funding dao-id (+ current-total sats))

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
  (sender-public-key (buff 33))
  (receiver-public-key (buff 33))
)
  (let (
    ;; TODO - Update mainnet address
    (was-mined (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin was-tx-mined-prev? block prev-blocks tx proof)))
    (parsed-tx (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin parse-tx tx)))

    (sender (unwrap! (element-at (get outs parsed-tx) sender-index) ERR_INVALID_TX))
    (receiver (unwrap! (element-at (get outs parsed-tx) receiver-index) ERR_INVALID_TX))
  )

    ;; TODO
    ;; (asserts! was-mined ERR_TX_NOT_MINED)
    (asserts! (is-eq (get-hashed-public-key sender-public-key) (get scriptPubKey sender)) ERR_WRONG_SENDER)
    (asserts! (is-eq (get-hashed-public-key receiver-public-key) (get scriptPubKey receiver)) ERR_WRONG_SENDER)

    (ok (get value receiver))
  )
)


(define-read-only (get-hashed-public-key (public-key (buff 33)))
  (concat 0x0014 (hash160 public-key))
)

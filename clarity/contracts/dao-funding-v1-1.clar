
;; 
;; Constants
;; 

(define-constant ERR_DAO_NOT_FOUND (err u20001))
(define-constant ERR_INVALID_TX (err u20002))
(define-constant ERR_TX_NOT_MINED (err u20003))

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
;; Parse
;; 

(define-public (add-user-funding
  (block { header: (buff 80), height: uint })
  (prev-blocks (list 10 (buff 80)))
  (tx (buff 1024))
  (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  (output-index uint)
)
  (let (
    (tx-info (try! (parse-tx block prev-blocks tx proof output-index)))

    ;; TODO - make registry dynamic
    ;; (dao-id (try! (contract-call? .dao-registry-v1-1 get-dao-id-by-public-key (get recipient tx-info))))

  )
    (asserts! (get mined tx-info) ERR_TX_NOT_MINED)

    ;; TODO - save info

    (ok (get sats tx-info))
  )
)

(define-read-only (parse-tx 
  (block { header: (buff 80), height: uint })
  (prev-blocks (list 10 (buff 80)))
  (tx (buff 1024))
  (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
  (output-index uint)
)
  (let (
    ;; TODO - Update mainnet address
    (was-mined (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin was-tx-mined-prev? block prev-blocks tx proof)))
    (parsed-tx (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin parse-tx tx)))

    (output (unwrap! (element-at (get outs parsed-tx) output-index) ERR_INVALID_TX))
  )
    (ok {
      mined: was-mined,
      recipient: (get scriptPubKey output),
      sats: (get value output)
    })
  )
)

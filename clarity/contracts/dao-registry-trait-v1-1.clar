(define-trait dao-registry-trait
  (
    (get-dao-count () (response uint uint))

    (get-dao-id-by-address ((buff 33)) (response (optional uint) uint))

    (get-dao-address-by-id (uint) (response (optional (buff 33)) uint))

    (is-dao-registered ((buff 33)) (response bool uint))
  )
)

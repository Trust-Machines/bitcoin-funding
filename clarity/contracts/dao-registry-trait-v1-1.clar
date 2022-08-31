(define-trait dao-registry-trait
  (
    (get-dao-count () (response uint uint))

    (get-dao-id-by-address ((buff 33)) (response (optional uint) uint))

    (get-dao-by-id (uint) (response (optional (tuple (address (buff 33)) (admin principal))) uint))

    (is-dao-registered ((buff 33)) (response bool uint))
  )
)

import { Container } from '@/components/Container'
import { useAccount } from '@micro-stacks/react'

export function Main() {
  const account = useAccount();
  console.log(account);

  return (
    <Container>
      <p>Congrats, you're signed in!</p>
      <p>Show some DAOs or whatever</p>
    </Container>
  );
}

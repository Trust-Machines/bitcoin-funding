import { Container } from '@/components/Container'
import { useAccount } from '@micro-stacks/react';

export function Main() {
  const account = useAccount();
  console.log(account);

  return (
    <Container>
      <span>Congrats, you're signed in!</span>
    </Container>
  );
}

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetUrl: string;
  companyName?: string;
}

export default function PasswordResetEmail({
  resetUrl,
  companyName = 'York Publishing Co.',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-[#111111] font-sans text-white">
          <Container className="mx-auto max-w-xl rounded-xl border border-[#333] bg-[#1e1e1e] p-8">
            <Heading className="text-center text-3xl font-bold">{companyName}</Heading>

            <Section className="mt-10 text-center">
              <Heading as="h2" className="text-2xl font-semibold">
                Reset Your Password
              </Heading>
              <Text className="mt-4 text-lg leading-relaxed text-[#a0a0a0]">
                We received a request to reset the password for your account.
              </Text>
              <Text className="text-lg leading-relaxed text-[#a0a0a0]">
                Click the button below to set a new password:
              </Text>

              <Button
                href={resetUrl}
                className="mt-8 inline-block rounded-lg bg-[#0ea5e9] px-8 py-4 text-lg font-bold text-white no-underline"
              >
                Reset Password
              </Button>

              <Text className="mt-8 text-base text-[#a0a0a0]">
                This link will expire in 1 hour for your security.
              </Text>
              <Text className="text-base text-[#a0a0a0]">
                If you didn&apos;t request this, you can safely ignore this email.
              </Text>
            </Section>

            <Section className="mt-12 text-center text-sm text-[#666]">
              <Text>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
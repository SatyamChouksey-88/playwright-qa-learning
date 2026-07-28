export class LoginPage {
  readonly hasAssertion: boolean;

  constructor() {
    this.hasAssertion = false;
  }

  static violatesThinPom(source: string): boolean {
    return /expect\s*\(/.test(source);
  }
}

export function loginPageSource(): string {
  return `
    async signIn() {
      await this.email.fill('a@test.com');
      await this.submit.click();
    }
  `;
}

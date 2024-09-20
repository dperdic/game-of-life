import bs58 from "bs58";
import nacl from "tweetnacl";

type SignMessage = {
  domain: string;
  address: string;
  nonce: string;
  statement: string;
};

export class SigninMessage {
  domain: string;
  address: string;
  nonce: string;
  statement: string;

  constructor({ domain, address, nonce, statement }: SignMessage) {
    this.domain = domain;
    this.address = address;
    this.nonce = nonce;
    this.statement = statement;
  }

  prepare() {
    return JSON.stringify({
      domain: this.domain,
      address: this.address,
      nonce: this.nonce,
      statement: this.statement,
    });
  }

  async validate(signature: string) {
    const msg = this.prepare();
    const signatureUint8 = bs58.decode(signature);
    const msgUint8 = new TextEncoder().encode(msg);
    const pubKeyUint8 = bs58.decode(this.address);

    return nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
  }
}

import { hash, compare } from "bcryptjs"

import { HashComparer } from "@/domain/forum/application/cryptography/hash-compare"
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator"

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGHT = 8

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGHT)
  }
  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}

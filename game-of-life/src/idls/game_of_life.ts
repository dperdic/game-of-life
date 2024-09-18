/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game_of_life.json`.
 */
export type GameOfLife = {
  "address": "BwocGJZSrrxfE3dSWVfCiL7AQSKRCjYbeHs4vErYEfmN",
  "metadata": {
    "name": "gameOfLife",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeBoard",
      "discriminator": [
        146,
        47,
        165,
        250,
        246,
        28,
        104,
        227
      ],
      "accounts": [
        {
          "name": "board",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "nftPubkey"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nftPubkey",
          "type": "pubkey"
        },
        {
          "name": "packedBoard",
          "type": {
            "array": [
              "u32",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "board",
      "discriminator": [
        79,
        48,
        160,
        63,
        153,
        132,
        240,
        56
      ]
    }
  ],
  "types": [
    {
      "name": "board",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "packedBoard",
            "type": {
              "array": [
                "u32",
                32
              ]
            }
          }
        ]
      }
    }
  ]
};

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game_of_life.json`.
 */
export type GameOfLife = {
  "address": "EU7cqobN7X8oK3oTEBhEXDs1SXkn2JDRzCmxMnfg8waj",
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
                "path": "assetId"
              }
            ]
          }
        },
        {
          "name": "payer",
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
          "name": "packedBoard",
          "type": {
            "array": [
              "u8",
              144
            ]
          }
        }
      ]
    },
    {
      "name": "mintNft",
      "discriminator": [
        211,
        57,
        6,
        167,
        15,
        219,
        35,
        251
      ],
      "accounts": [
        {
          "name": "treeConfig",
          "writable": true
        },
        {
          "name": "leafOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "merkleTree",
          "writable": true
        },
        {
          "name": "treeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "collectionMint"
        },
        {
          "name": "collectionMetadata",
          "writable": true
        },
        {
          "name": "editionAccount"
        },
        {
          "name": "bubblegumSigner"
        },
        {
          "name": "logWrapper"
        },
        {
          "name": "compressionProgram"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "bubblegumProgram"
        },
        {
          "name": "collectionAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "board",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "packedBoard",
          "type": {
            "array": [
              "u8",
              144
            ]
          }
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
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
                "u8",
                144
              ]
            }
          }
        ]
      }
    }
  ]
};

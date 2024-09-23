import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CnftProgram } from "../target/types/cnft_program";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("cnft_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CnftProgram as Program<CnftProgram>;

  let treeKeypair: Keypair;

  before(async () => {
    treeKeypair = Keypair.generate();
  });

  it("Creates a merkle tree", async () => {
    const tx = await program.methods
      .createMerkleTree(14, 64)
      .accounts({
        treeConfig: treeKeypair.publicKey,
        authority: provider.wallet.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([treeKeypair])
      .rpc();

    const treeConfig = await program.account.treeConfig.fetch(
      treeKeypair.publicKey,
    );
    expect(treeConfig.authority.toString()).to.equal(
      provider.wallet.publicKey.toString(),
    );
    expect(treeConfig.height).to.equal(14);
    expect(treeConfig.bufferSize).to.equal(64);
  });

  it("Mints a compressed NFT and stores data", async () => {
    const collectionMint = Keypair.generate();
    const dataArray = new Array(144).fill(0);

    const metadataArgs = {
      name: "Test NFT",
      symbol: "TEST",
      uri: "https://example.com/metadata",
      sellerFeeBasisPoints: 500,
      primarySaleHappened: false,
      isMutable: true,
      editionNonce: 0,
      tokenStandard: 0,
      collection: { key: collectionMint.publicKey, verified: false },
      uses: null,
      tokenProgramVersion: 0,
      creators: [
        {
          address: provider.wallet.publicKey,
          verified: false,
          share: 100,
        },
      ],
    };

    const tx = await program.methods
      .mintCompressedNft(metadataArgs, dataArray)
      .accounts({
        treeAuthority: treeKeypair.publicKey,
        leafOwner: provider.wallet.publicKey,
        leafDelegate: provider.wallet.publicKey,
        merkleTree: treeKeypair.publicKey,
        payer: provider.wallet.publicKey,
        treeDelegate: provider.wallet.publicKey,
        collectionAuthority: provider.wallet.publicKey,
        collectionAuthorityRecordPda: PublicKey.default,
        collectionMint: collectionMint.publicKey,
        collectionMetadata: PublicKey.default,
        editionAccount: PublicKey.default,
        bubblegumSigner: PublicKey.default,
        logWrapper: PublicKey.default,
        compressionProgram: PublicKey.default,
        tokenMetadataProgram: PublicKey.default,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: PublicKey.default,
      })
      .rpc();

    // In a real scenario, you would need to fetch the actual asset ID
    // For this test, we'll derive it based on the accounts used
    const [assetId] = await PublicKey.findProgramAddress(
      [
        Buffer.from("asset"),
        treeKeypair.publicKey.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId,
    );

    const [nftPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("nft"), assetId.toBuffer()],
      program.programId,
    );

    const nftData = await program.account.nftData.fetch(nftPDA);
    expect(nftData.assetId.toString()).to.equal(assetId.toString());
    expect(nftData.data).to.deep.equal(dataArray);
  });
});

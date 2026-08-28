# FundingWala — Crowdfunding dApp on Stellar Testnet

A decentralized crowdfunding application built on the **Stellar Testnet** using a **Soroban smart contract**. Donors connect their Stellar wallet (Freighter, Albedo, or xBull) and donate XLM toward a campaign goal with real-time progress tracking.

---

## 🌐 Live Demo

> Deploy to Vercel/Netlify using instructions below.

---

## 📋 Level 2 Submission Checklist

### ✅ Required Items
| Requirement | Status | Details |
|---|---|---|
| 3 error types handled | ✅ | `WalletConnectionError` (🔴), `ContractExecutionError` (🟠), `NetworkError` (🟡) |
| Contract deployed on testnet | ✅ | See contract address below |
| Contract called from frontend | ✅ | `donate()`, `get_campaign()`, `get_raised()` |
| Transaction status visible | ✅ | Pending → Confirmed/Failed with explorer link |
| 10+ meaningful commits | ✅ | See commit history |
| Multi-wallet app | ✅ | Freighter + Albedo + xBull |
| Real-time event integration | ✅ | Live donor feed via Soroban event polling |
| Crowdfunding page | ✅ | Progress bar, donate form, donor feed |

---

## 🔗 Deployed Contract

**Contract Address (Stellar Testnet):**
```
CBK6FGJ3DXHYFYUVHUDSLTXANQSSE6XN6LNLGEU6TC5LIWLSYR4OVO5V
```

**View on Stellar Expert:**
[https://stellar.expert/explorer/testnet/contract/CBK6FGJ3DXHYFYUVHUDSLTXANQSSE6XN6LNLGEU6TC5LIWLSYR4OVO5V](https://stellar.expert/explorer/testnet/contract/CBK6FGJ3DXHYFYUVHUDSLTXANQSSE6XN6LNLGEU6TC5LIWLSYR4OVO5V)

**Initialization Transaction Hash:**
```
1aeaf0680894e9de3d65d94771d7b128e1fdda501890140f718bc90cf67d2e84
```
[View Init TX on Stellar Expert](https://stellar.expert/explorer/testnet/tx/1aeaf0680894e9de3d65d94771d7b128e1fdda501890140f718bc90cf67d2e84)

---

## 📸 Screenshots

### Wallet Options Available
Connect with any of 3 supported wallets — Freighter 🚀, Albedo 🔑, or xBull ⚡
> Screenshot: wallet selection panel showing all 3 options with Install/Ready status

### Campaign Progress
> Screenshot: progress bar showing raised/goal amounts with real-time updates

### Donation Flow
> Screenshot: donate form + transaction confirmed state with tx hash explorer link

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Tailwind CSS |
| Smart Contract | Rust Soroban (deployed on Stellar Testnet) |
| Stellar SDK | `@stellar/stellar-sdk` v11 |
| Wallets | Freighter, Albedo, xBull |
| Network | Stellar Testnet (Soroban RPC) |
| Deploy | Vercel / Netlify |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- One of: **Freighter** ([freighter.app](https://www.freighter.app/)), **Albedo** ([albedo.link](https://albedo.link/)), or **xBull** ([xbull.app](https://xbull.app/))
- A funded Stellar Testnet account ([Friendbot](https://friendbot.stellar.org/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Thanos0s/Stellar_01.git
cd Stellar_01/my-react-app

# 2. Install dependencies
npm install

# 3. Start development server (HTTPS required for wallet extensions)
npm start
```

Open **`https://localhost:3002`** in your browser.
> Accept the self-signed certificate warning — this is expected for local HTTPS.

### Environment Variables (optional)

Create `.env.local` in `my-react-app/`:
```
REACT_APP_CONTRACT_ADDRESS=CBK6FGJ3DXHYFYUVHUDSLTXANQSSE6XN6LNLGEU6TC5LIWLSYR4OVO5V
```

---

## 📖 How to Use

### 1. Connect Wallet
- Choose **Freighter**, **Albedo**, or **xBull** from the wallet panel
- Approve the connection request in your wallet extension
- Your address and XLM balance appear immediately

### 2. Donate
- Enter an amount (minimum 0.5 XLM) or click a quick-amount preset (1, 5, 10, 25, 50 XLM)
- Click **"Donate Now"**
- Approve the transaction in your wallet
- Watch the progress bar update in real-time

### 3. Track Transaction
- Transaction status shows `Pending → Confirmed` with a spinner
- Click the tx hash to view it on Stellar Expert testnet explorer
- The donor feed on the right updates live with each donation

---

## 🗂 Project Structure

```
my-react-app/src/
├── App.js                          # Main crowdfunding layout
├── config.js                       # Network + contract + campaign config
├── components/
│   ├── CrowdfundingHero.jsx        # Campaign header with goal stats
│   ├── ProgressBar.jsx             # Animated donation progress bar
│   ├── DonateForm.jsx              # Donate form with 3 error type UI
│   ├── DonorFeed.jsx               # Live donation event feed
│   ├── WalletConnect.jsx           # Multi-wallet connection panel
│   ├── TransactionStatus.jsx       # Tx status badge with explorer link
│   └── ErrorNotification.jsx       # Type-aware error component
├── hooks/
│   ├── useWallet.js                # Wallet connection + balance
│   └── useCrowdfunding.js          # Campaign state + donate flow
├── services/
│   ├── contractService.js          # Soroban contract calls
│   ├── walletService.js            # Multi-wallet signing
│   └── eventService.js             # Contract event polling
└── utils/
    └── errorHandler.js             # 3-type error class system
contract/
└── src/lib.rs                      # Soroban Rust smart contract
```

---

## 🔐 Error Handling (3 Types)

| Error Type | When | UI |
|---|---|---|
| 🔴 `WalletConnectionError` | Wallet not installed, user rejected | Red banner + install links |
| 🟠 `ContractExecutionError` | Low balance, tx simulation fail, tx rejected | Orange banner + retry |
| 🟡 `NetworkError` | RPC timeout, no internet | Yellow banner + retry button |

---

## 📜 Smart Contract Functions

| Function | Type | Description |
|---|---|---|
| `initialize(admin, goal, deadline)` | Write | Set up campaign (already called) |
| `donate(donor, amount)` | Write | Accept donation, emit `Donated` event |
| `get_campaign()` | Read | Returns `{ raised, goal, deadline, active }` |
| `get_raised()` | Read | Returns current raised amount |
| `get_donor_amount(donor)` | Read | Returns total donated by address |

---

## 🚢 Deployment (Vercel)

```bash
# From my-react-app directory:
npm run build

# Then deploy the build/ folder to Vercel
# Or connect your GitHub repo to Vercel — it auto-detects Create React App
```

The included `vercel.json` handles SPA routing and sets the contract address env var.

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| Wallet not detected | Install the extension and refresh |
| "Permission denied" | Click Approve in your wallet popup |
| Account not funded | Use [Friendbot](https://friendbot.stellar.org/) |
| Certificate warning | Normal for localhost — click "Proceed" |
| Transaction timeout | Soroban testnet can be slow; wait 30s and retry |

---

## 📚 Resources

- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Docs](https://docs.stellar.org/build/smart-contracts)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)
- [Friendbot (Testnet Funder)](https://friendbot.stellar.org/)

---

## ✅ Level 2 (Yellow Belt) Submission

- ✅ Multi-wallet support (Freighter, Albedo, xBull)
- ✅ Soroban contract deployed on Stellar Testnet
- ✅ Contract called from frontend (donate, get_campaign)
- ✅ Real-time event integration (live donor feed)
- ✅ 3 error types handled with distinct UI
- ✅ Transaction status visible (pending → confirmed)
- ✅ Crowdfunding page with animated progress bar
- ✅ 10+ meaningful commits
- ✅ Public GitHub repository
- ✅ Complete README with contract address + tx hash

---

*Built with ❤️ on Stellar — Level 2 (Yellow Belt) submission*

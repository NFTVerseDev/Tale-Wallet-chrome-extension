import {pinta_cloud,NFTVERSE_DEV_API,BLOCKCHAIN_SERVICE,MARKETPLACE_SERVICE,app_token,ALGO_SCAN_ACCOUNT,ALGO_SCAN_TRANSACTION,talewallet_url,tale_coin_token,algo_node} from "./config.js";
import AlgorandClient from "./AlgorandClient.js";

//encrypt and decrypt
// var ciphertext = CryptoJS.AES.encrypt(JSON.stringify("my message"), 'secretKey').toString();
// console.log(ciphertext)
// console.log(CryptoJS.SHA256("Message").toString())
// console.log(CryptoJS.SHA256("Message").toString())

// let bytes = CryptoJS.AES.decrypt(ciphertext, 'secretKey');
// const decryptedData = bytes.toString(CryptoJS.enc.Utf8) && JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // chrome.runtime.onMessage.addListener((obj,sender,response)=>{
    //     console.log(obj)
    //     console.log("hi")
    // })
    


document.addEventListener('DOMContentLoaded', function() {
    
    chrome.storage.local.get(["leftAt"],(result)=>{
        if (result.leftAt === "email_verification") {
          chrome.storage.local.get(["secretKey"], (res) => {
            
            
            console.log([1,2,3,4,5,6])
            const propertyValues = Object.values(JSON.parse(res.secretKey));
            // propertyValues.map((key) => console.log(key))
            savePassphraseToServer(algosdk.secretKeyToMnemonic(propertyValues));
          });
        }else if(result.leftAt === "account_creation"){
            chrome.storage.local.get(["secretKey"], (res) => {
                // console.log([1,2,3,4,5,6])
                //  const propertyValues = Object.values(JSON.parse(res.secretKey));
                // savePassphraseToServer(algosdk.secretKeyToMnemonic(propertyValues));
                // accountSetup(propertyValues);
                setUpPassword()
              });
        }
        else{
            chrome.storage.local.get(["userCredentials"], (res) => {
                
                if(res.userCredentials){
                    console.log(res.userCredentials)
                    loginWithPassword();
                }
                else{
                    getValues();
                }
            })
            
        }
    })
    
    // getValues();
    
    
    
});




const backUi = `

<div>
<div class="back-s1"></div>
<div class="back-s2"></div>
<div class="back-s3"></div>
</div>

`;



function loginWithPassword(){
    document.getElementById('wallet_div').innerHTML = `
    <div class="flex flex-col gap-100">
      <div>
          <img src="../images/talewallet.svg" alt="Avatar" class="avatar"/>
      </div>
      <div class="flex flex-col gap-10">
      
      <div class="flex flex-col shadow-1 w-full  email-input-container">
        <input type="password" class="border-none outline-none underline-none" placeholder="Enter your password" name="uname" id="input_login_password" required>
      </div>
      <div>
      Forgot password ? <a class="border-none cursor-pointer" id="create-or-recover"> click here </a>
      </div>
     
      <span class="text-warning" id="login_warning"></span>
      <button class="btn primary-btn" id="submit_password" >Submit</button>
      </div>
      
    </div>
    `
    // <button class="" id="toggle-pass-view">View Password</button>
    document.getElementById("create-or-recover").addEventListener("click",logout)
    
    const inputLoginPassword = document.getElementById("input_login_password");

    // const passView = document.getElementById("toggle-pass-view")
    // passView.addEventListener("click",()=>{
    //     inputLoginPassword.type==="text" ?
    //      (() =>{
    //         passView.innerHTML="View Password" 
    //      inputLoginPassword.type="password"})():
    //      (() =>{
    //         passView.innerHTML="Hide Password" 
    //      inputLoginPassword.type="text"
    //      })()
    // })
    document.getElementById("submit_password").onclick = ()=>{
        chrome.storage.local.get(["userCredentials"],(res)=>{
            if(CryptoJS.SHA256(inputLoginPassword.value).toString() === res.userCredentials.password){
            getClient();
            getValues();
            }else{
                document.getElementById("login_warning").innerText="Wrong password"
            }
        })
    }
    
}



function logout() {
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        document.getElementById('wallet_div').innerHTML = '';
        // document.getElementById('tlw_logout').innerHTML = '';
        document.getElementById("tale-wallet-headiong").innerHTML ="Tale Wallet"
        
        document.getElementById('wallet_asset_div').classList.add("hidden");
        getValues();
    });
}

async function getBalance(addr) {
    const token = "ef920e2e7e002953f4b29a8af720efe8e4ecc75ff102b165e0472834b25832c1";
    const server = "https://testnet-api.algonode.cloud";
    const port = 443;
    const client = new algosdk.Algodv2(token, server, port);
    (async () => {
        let accountDet = await client.accountInformation(addr).do();
        // setting balance to state
        console.log(accountDet);
        let amount =  accountDet.amount / 1000000
        console.log( amount)
        showAssets(accountDet)
        console.log(document.getElementById("show-Nfts"))
        // .addEventListener("click",()=>{
        //     showAssets(accountDet) 
        // })
        

        document.getElementById('wallet_balance').innerHTML  = `${amount} Algos`;
        return amount;
    })().catch((e) => {
        console.log(e);
        return 0;
    });
}



const fetchAssetDetails= async (url) =>{

 const response = await fetch(`${pinta_cloud}/${url}`)
 const data = await response.json();
 console.log(data)
 return data


}

function redirectToTalewalletWeb(append=""){
    window.open(`https://talewallet.com/${append}`)
}

async function showAssets(accountInfo){
    if(accountInfo["created-assets"] === undefined){
        document.getElementById('wallet_asset_div').innerHTML  = '<div class="container" style="background-color:#f1f1f1; line-height: 2">No asset found</div>';

    } else {
        // var c  = `<div class="font-bold text-medium flex justify-between  relative  ">
        //              <button class="activity-button activity-selected relative z-10" id="show-Nfts">NFTs </button>
        //              <button class="activity-button relative left-10">Token </button>
        //              <button class="activity-button">Activities </button>
        //              <div class="activity-border"></div>
        //           </div>
        var c =           `<div class=" flex flex-wrap justify-center gap-20"> `;
        console.log(accountInfo['created-assets'])
        var assetobj = accountInfo['created-assets']
        if(assetobj.length > 0) {
        for (const item in assetobj) {
            try {
             const asset = await fetchAssetDetails(assetobj[item]?.params?.url?.split("/")[2]);

             const imageSrc = asset?.mime_type?.includes("image") ? `${pinta_cloud}/${asset?.image?.split("/")[2]}` : "../images/talecoin.png"
            
            // console.log(`key = ${item}, value = ${assetobj[item]["assetname"]}`);
            c = c + `<a href="https://testnet.talewallet.com/asset/${assetobj[item]?.index}" target="_blank">
            <div class="flex flex-col asset-container" >
            <div>
                <img src= ${imageSrc} class ="asset-image" />
            </div>
            <div class="break-word"> ${assetobj[item]?.params?.name} </div>
            </div>
            </a>`;
        }catch(error){
                    console.log(error)
            }
        }
    }
    else{
        c= "<span>No Assets to show !!</span>"
    }
        document.getElementById('wallet_asset_div').classList.remove("hidden")
        document.getElementById("wallet_asset_container").innerHTML = c+ "</div>"
    }
    document.getElementById("show-token").classList.remove("activity-selected")
    document.getElementById("show-Nfts").classList.add("activity-selected")
    document.getElementById("show-activity").classList.remove("activity-selected")

}


//wallet asset functions to navigate

//token



 async function getTokens(){
    
    const client = await AlgorandClient;
    chrome.storage.local.get(["tale_wallet_address"], async function(result){
        let accountInfo = await client.accountInformation(result?.tale_wallet_address).do();
        let accountAsset = accountInfo["created-assets"];

        if (accountInfo["created-assets"] === undefined) {
            accountAsset =[]
            // document.getElementById('wallet_asset_div').innerHTML = '<div class="container" style="background-color:#f1f1f1; line-height: 2">No asset found</div>';
        } else {
           
            var assetobj = accountInfo['created-assets']
            let array = [];
            let assetUrl = [];
            for (const item in assetobj) {
                array = ([...array, { key: assetobj[item].index, value: assetobj[item].params.name }])
                assetUrl = ([...assetUrl, { key: assetobj[item].index, value: assetobj[item].params.url }])
            }
            accountAsset = (array);
        }

        let amount = accountInfo?.amount;
        let array = [];
        if(accountInfo.assets){
            let assetsArray = accountInfo.assets;
            let assetUrl = [];
            assetsArray?.map((asset) => {
                array = [...array, { key: asset['asset-id'], amount: asset.amount }]
            })
            
        }

        const optInAsset = (assetId) => {

            chrome.storage.local.get(["userCredentials"],(res) =>{
                console.log("in handle optin")

            const waitForConfirmation = async function (AlgorandClient, txId) {
                let response = await AlgorandClient.status().do();
                let lastround = response["last-round"];
                while (true) {
                    const pendingInfo = await AlgorandClient.pendingTransactionInformation(txId).do();
                    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                        //Got the completed Transaction
                        // console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
                        break;
                    }
                    lastround++;
                    await AlgorandClient.statusAfterBlock(lastround).do();
                }
            };
    
    
            // Function used to print created asset for account and assetid
            const printCreatedAsset = async function (AlgorandClient, account, assetid) {
                // note: if you have an indexer instance available it is easier to just use this
                //     let accountInfo = await indexerClient.searchAccounts()
                //    .assetID(assetIndex).do();
                // and in the loop below use this to extract the asset for a particular account
                // accountInfo['accounts'][idx][account]);
                let accountInfo = await AlgorandClient.accountInformation(account).do();
                for (let idx = 0; idx < accountInfo['created-assets'].length; idx++) {
                    let scrutinizedAsset = accountInfo['created-assets'][idx];
                    if (scrutinizedAsset['index'] == assetid) {
                        // console.log("AssetID = " + scrutinizedAsset['index']);
                        let myparms = JSON.stringify(scrutinizedAsset['params'], undefined, 2);
                        // console.log("parms = " + myparms);
                        break;
                    }
                }
            };
            // Function used to print asset holding for account and assetid
            const printAssetHolding = async function (AlgorandClient, account, assetid) {
                // note: if you have an indexer instance available it is easier to just use this
                //     let accountInfo = await indexerClient.searchAccounts()
                //    .assetID(assetIndex).do();
                // and in the loop below use this to extract the asset for a particular account
                // accountInfo['accounts'][idx][account]);
                let accountInfo = await AlgorandClient.accountInformation(account).do();
                for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
                    let scrutinizedAsset = accountInfo['assets'][idx];
                    if (scrutinizedAsset['asset-id'] == assetid) {
                        let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2);
                        // console.log("assetholdinginfo = " + myassetholding);
                        break;
                    }
                }
            };
            
            // if (oldMnemonic?.length > 1) {
            //     var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(appCtx.mnemonic), 'secretKey').toString();
            //     let bytes = CryptoJS.AES.decrypt(ciphertext, 'secretKey');
            //     decryptedData = bytes.toString(CryptoJS.enc.Utf8) && JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            // }
                var bytes = CryptoJS.AES.decrypt(res.userCredentials.encryptedPassphrase, res.userCredentials.password);
               const decryptedData = bytes.toString(CryptoJS.enc.Utf8) && JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
               console.log(typeof decryptedData)
               //TODO: check if array then join else go direclty;
           
            // JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            var account3_mnemonic;
            if(typeof decryptedData === "string"){
                account3_mnemonic=decryptedData;
            }else{
                account3_mnemonic = decryptedData.join(" ");
            }
            
            var recoveredAccount3 = algosdk.mnemonicToSecretKey(account3_mnemonic);

            
            
    
            (async () => {
    
                let note = undefined;
                let assetID = parseInt(tale_coin_token);
                // console.log(process.env.REACT_APP_TAIL_COIN_TOKEN);
    
                let params = await AlgorandClient.getTransactionParams().do();
                //comment out the next two lines to use suggested fee
                params.fee = 1000;
                params.flatFee = true;
    
                let sender = recoveredAccount3.addr;
                let recipient = sender;
                // We set revocationTarget to undefined as 
                // This is not a clawback operation
                let revocationTarget = undefined;
                // CloseReaminerTo is set to undefined as
                // we are not closing out an asset
                let closeRemainderTo = undefined;
                // We are sending 0 assets
                let amount = 0;
    
    
                // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
                let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
                    amount, note, assetID, params);
    
                // Must be signed by the account wishing to opt in to the asset    
                let rawSignedTxn = opttxn.signTxn(recoveredAccount3.sk);
                let opttx = (await AlgorandClient.sendRawTransaction(rawSignedTxn).do());
                // console.log("Transaction : " + opttx.txId);
                // wait for transaction to be confirmed
                await waitForConfirmation(AlgorandClient, opttx.txId);
    
                //You should now see the new asset listed in the account information
                // console.log("Account 3 = " + recoveredAccount3.addr);
                await printAssetHolding(AlgorandClient, recoveredAccount3.addr, assetID);
                //////////
                showTaleData();
                document.getElementById("opt-in-error").innerHTML =""
                document.getElementById("opt-in-option").innerHTML="opted"
                document.getElementById("opt-in-option").disabled=true;
            })().catch(e => {

                // console.log(e);
                // console.trace();
                document.getElementById("opt-in-option").disabled=false
                    document.getElementById("opt-in-option").innerHTML="opt in"
                    document.getElementById("opt-in-error").innerHTML ='Your wallet should have atleast 0.451 ALGOS to opt In token and claim reward'
                
                // setOptInSuccessfull(false)
            });
        })
    
        }
        const showTaleData = async () => {
            console.log('showTaleData');
            chrome.storage.local.get(["tale_wallet_address"],async (res) =>{
            let accountInfo = await AlgorandClient.accountInformation(res.tale_wallet_address).do();
            console.log(accountInfo);
            // setAmount(accountInfo.amount / 1000000)
    
            // setAccountAsset(accountInfo["assets"]);
            if (accountInfo["assets"] === undefined) {
                // setAccountAsset([]);
                // document.getElementById('wallet_asset_div').innerHTML = '<div class="container" style="background-color:#f1f1f1; line-height: 2">No asset found</div>';
            } else {
                // console.log(accountInfo['assets'])
                var assetobj = accountInfo['assets']
                let assetUrl = [];
                // console.log();
                assetobj?.map((asset) => {
                    array = [...array, { key: asset['asset-id'], amount: asset.amount }]
                })
                // console.log(array);
            }
            const isassetIdPresent = array?.filter((assets) => {
                return (assets.key === tale_coin_token)
            })
            if (isassetIdPresent?.length > 0) {
                // setTaleAmount((isassetIdPresent[0]?.amount) / 100)
                console.log((isassetIdPresent[0]?.amount) / 100)
                document.getElementById("tale_amount").innerHTML = (isassetIdPresent[0]?.amount)/ 100
                // console.log(isassetIdPresent);
                // setOptInSuccessfull(false)
                // setOptIn(true);
            }
            else {
                // setOptIn(false)
                console.log("false")
            }
        })
    
        }

        const showTransactions = (taleAmount) =>{
            
            document.getElementById("wallet_div").innerHTML = `
            <div class="flex flex-col gap-10 items-center" >
                <div class="flex justify-start w-full">
                     <button class="border-none" id="back">${backUi}</button>
                </div>
                <img src="../images/talecoin.png" class="w-100 object"/>
                <div class="flex justify-center gap-10 text-lg font-bold">
                <span>${isNaN(taleAmount)  ? "" :taleAmount}</span>
                <span class="text-tale">Tale</span>
                </div>
                <div class="flex flex-col gap-10 w-full">
                      <div class="py-10 w-full border-b-g">Activity</div>  
                </div>

            </div>
            `
            const activitiesDiv = document.createElement("div")
            activitiesDiv.id="wallet_asset_container"
            document.getElementById("wallet_div").append(activitiesDiv);

            document.getElementById("back").addEventListener("click",()=>{
                getValues();
            })
            getActivities()

        }
        
        const handleOptIn = () => {
            const isAssetIdPresent = array?.filter((asset) => { return asset.key === tale_coin_token });
            if (isAssetIdPresent?.length === 0) {
                try {
                    optInAsset(tale_coin_token)
                    document.getElementById("opt-in-option").disabled =true;
                    document.getElementById("opt-in-option").innerHTML="opting ...."
                }
                catch {
                    console.log("error occured")
                    // setOptInSuccessfull(false)
                    // toast.error('Your wallet should have atleast 0.451 ALGOS to opt In token and claim reward')
                }
                
            }
            else{
                document.getElementById("opt-in-option").innerHTML="already opted"
                document.getElementById("opt-in-option").disabled=true;
            }
        }

        

        const isAssetIdPresent = array?.filter((assets) => {
            return (assets.key === tale_coin_token)

        })
            const taleAmount = ((isAssetIdPresent[0]?.amount) / 100)
            console.log(isAssetIdPresent[0]?.amount)
            document.getElementById("wallet_asset_container").innerHTML =`
            <div class="flex flex-col items-center w-full">
                <div class="token-container cursor-pointer" id="show-transactions">
                <div class="flex justify-center items-center gap-10" >
                <span>
                <img src="../images/talecoin.png" class="w-40 h-40 object-contain" />
                </span>
                <span id="tale_amount">${isNaN(taleAmount)  ? "" :taleAmount}</span>
                <span>Tale</span>
                </div>
                <button class="cursor-pointer border-none" id="opt-in-option">
                </button>
                </div>
                <div class="text-warning" id="opt-in-error"></div>
            </div>    
            `
            document.getElementById("show-transactions").addEventListener("click",() =>{
                document.getElementById("wallet_asset_div").classList.add("hidden")
                showTransactions(taleAmount)

            })
            
            if (isAssetIdPresent?.length === 0) {
                try {
                    chrome.storage.local.get(["userCredentials"],(res) =>{
                        if(res.userCredentials.encryptedPassphrase !==""){
                            // document.getElementById("opt-in-option").innerHTML ="<span>Opt-in</span>"
                
                            
                            document.getElementById(
                              "opt-in-option"
                            ).disabled = false;
                            document.getElementById("opt-in-option").innerHTML =
                              "Opt-in";
                        }
                       })
                
                    
                }
                catch {
                    console.log("error occured")
                    // setOptInSuccessfull(false)
                    // toast.error('Your wallet should have atleast 0.451 ALGOS to opt In token and claim reward')
                }
                
            }
            else{
                document.getElementById("opt-in-option").innerHTML="already opted"
                document.getElementById("opt-in-option").disabled=true;
            }

       chrome.storage.local.get(["userCredentials"],(res) =>{
        if(res.userCredentials){
            // document.getElementById("opt-in-option").innerHTML ="<span>Opt-in</span>"

            document.getElementById("opt-in-option").addEventListener("click",(e) =>{
                e.stopPropagation();
                console.log("clicked")
                    handleOptIn()
            })
        }
       })
    })
    
}



//activities

 async  function getActivitiesData(taleWalletAddress){
    let response = await fetch(`${algo_node}/accounts/${taleWalletAddress}/transactions?limit=100`)
    response = await response.json();
    return response
}

 function getActivities(){
    // const activitiesData = await getActivitiesData();
    chrome.storage.local.get(["tale_wallet_address"],async function(res){
        
       const activitiesData = await getActivitiesData(res.tale_wallet_address)
        const transactions = activitiesData.transactions;

      try{ 
        if(transactions?.length > 0){
            console.log(transactions)
            document.getElementById("wallet_asset_container").innerHTML = `
            <div class="overflow-x-scroll">
            <div class="w-1000 flex flex-col gap-5">
                <div class="activity-item-container text-lg font-bold">
                    <div>TXid</div>
                    <div>Block</div>
                    <div>Time</div>
                    <div>Sender</div>
                    <div></div>
                    <div>Receiver</div>
                    <div>Amount</div>
                    <div>Fees</div>
                    <div>Type</div>
                </div>
               ${transactions.map((transaction) => {
                 return `<div class="activity-item-container font-bold">
                    <a href="${ALGO_SCAN_TRANSACTION}/${transaction.id}" target="_blank">
                    <div class="limit-words-overflow"> ${transaction.id}</div>
                    
                    </a>
                    <span>${transaction["last-valid"]}</span>
                    <span>${transaction["round-time"]}</span>
                    <a href="${ALGO_SCAN_ACCOUNT}/${transaction.sender}" target="_blank">
                      <div class="limit-words-overflow"> ${transaction.sender}</div>
                    </a>
                    <div>
                      to
                    </div>
                    <a href="${ALGO_SCAN_ACCOUNT}/${transaction["asset-transfer-transaction"]?.receiver || transaction["payment-transaction"]?.receiver}" target="_blank">
                       <div class="limit-words-overflow"> ${transaction["asset-transfer-transaction"]?.receiver || transaction["payment-transaction"]?.receiver}</div>
                    </a>
                    <span>
                       ${transaction["asset-transfer-transaction"]?.amount/100 || transaction["payment-transaction"]?.amount/100 || 0}
                    </span>
                    <span>
                      ${transaction.fee/1000000}
                    </span>
                    <span>${transaction["asset-transfer-transaction"] ?"Opt in" : "Transfer"}</span>
                </div>`;
               }).join("")}
            </div>
        </div>`
      }

      else{
        document.getElementById("wallet_asset_container").innerHTML =`<span>No transaction yet !!</span>`
      }

    }catch(error){
        console.log(error)
    }
        
    })

}



// wallet asset navigation buttons 
document.getElementById("show-token").addEventListener("click",()=>{
    document.getElementById("show-token").classList.add("activity-selected")
    document.getElementById("show-Nfts").classList.remove("activity-selected")
    document.getElementById("show-activity").classList.remove("activity-selected")
    getTokens();
})

document.getElementById("show-Nfts").addEventListener("click",()=>{
    document.getElementById("show-token").classList.remove("activity-selected")
    document.getElementById("show-Nfts").classList.add("activity-selected")
    document.getElementById("show-activity").classList.remove("activity-selected")
    getValues();
})

document.getElementById("show-activity").addEventListener("click",()=>{
    document.getElementById("show-token").classList.remove("activity-selected")
    document.getElementById("show-Nfts").classList.remove("activity-selected")
    document.getElementById("show-activity").classList.add("activity-selected")
    getActivities();
})




async function getClient(){
    const token = "ef920e2e7e002953f4b29a8af720efe8e4ecc75ff102b165e0472834b25832c1";
    const server = "http://hackathon.algodev.network";
    const port = 9100;
    const client = new algosdk.Algodv2(token, server, port);
    (async () => {
        console.log(await client.status().do());
        return await client;
    })().catch((e) => {
        console.log(e);
    });
}
function copyToClipboard(address) {
    navigator.clipboard.writeText(address);
    var tickUI =  ` <span class="transparencyli">
                            <span class="checkmark">
                           <div class="checkmark_circle"></div>
                            <div class="checkmark_stem"></div>
                           <div class="checkmark_kick"></div>
                           </span>\n`;
    document.getElementById('copy_to_clipboard').innerHTML = tickUI;
}


function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


  const profileModalHTML = `
        <div class="profile-modal" id="profile-modal">
        <div class="flex gap-10 px-10 items-center">
          <span id="close-profile-modal">${backUi}</span>
          <Span class="font-semibold text-medium">Profile</Span>
        </div>
       <div class="flex flex-col gap-10 px-10">
          <div class="modal-items-container" id="lock-wallet">
              <span><img src="../images/profile-icons/lock.svg" class="img-icon"/></span>
              <Span class="font-semibold text-medium">Lock</Span>
          </div>
          <div class="modal-items-container" id="view_on_algoscan">
              <span><img src="../images/profile-icons/algoscan.svg" class="img-icon"/></span>
              <Span class="font-semibold text-medium">View on Algoscan</Span>
          </div>
          <div class="modal-items-container" id="talewallet_support">
              <span> <img src="../images/profile-icons/support.png" class="img-icon"/></span>
              <Span class="font-semibold text-medium">Support</Span>
          </div>
          <div class="modal-items-container" id="account-details-btn">
              <span><img src="../images/profile-icons/accountdetail.svg" class="img-icon"/></span>
              <Span class="font-semibold text-medium">Account details</Span>
          </div>
          <div class="modal-items-container" id="e-kyc">
              <span><img src="../images/profile-icons/Kyc.svg" class="img-icon"/></span>
              <Span class="font-semibold text-medium">KYC</Span>
          </div>
       </div>
      </div>
        `
    const accountDetailsModalHTML =`
    <div class="profile-modal" id="profile-modal">
    <div class="flex gap-10 px-10 items-center">
      <span id="close-profile-modal">${backUi}</span>
      <Span class="font-semibold text-medium">Profile</Span>
    </div>
    <div class="flex flex-col gap-10 px-10">
        <div class="flex justify-center">
            <img src="../images/profile.svg"  class="d-50 object-contain"/>
        </div>
        <div class="flex justify-center" id="qr-code">
            
        </div>
        <div class = "flex gap-10 items-center box-shadow-1 wallet-address-container">
            <div style=" overflow: hidden; text-overflow: ellipsis;"  id="tale_wallet_address"></div>
            <div  id="copy_to_clipboard"> <img src="../images/copy.png" alt="Copy Address" width="25" /> </div>
        </div>
        <button class="btn primary-btn" id="view_on_algoscan">View on Algoscan</button>
    </div>

</div>
    
    `



function getValues() {
  chrome.storage.local.get(["tale_wallet_address"], async function (result) {
    console.log("Value currently is ", result);
    var tale_wallet_address = result.tale_wallet_address;
    console.log("wallet Address: " + tale_wallet_address);
    let balance = getBalance(tale_wallet_address);
    if (tale_wallet_address) {
      //show account balanceshow-token
      document.getElementById("tale-wallet-headiong").innerHTML = `
            <div class="flex justify-between items-center">
            <div>
                <img src="../images/talewallet.png" class="w-40 h-40 object-contain" />
            </div>
            <div class="flex items-center border-slate border-radius-10 gap-10 px-10">
                    <img src="../images/testnet.png" class=" h-15 object-contain" />
                    <span class="font-bold text-medium">Testnet</span>
            </div>
            <div id="profile-container" class="relative">
                <img src="../images/profile.svg" class="w-40 h-40 object-contain" />
            </div>
            <div class="hidden" id="modal-container">
                    
                </div>
        </div>
            `;

            // function generateQr(user_input) {
            //     var qrcode = new QRCode(document.querySelector("#qr-code"), {
            //         text: `${user_input.value}`,
            //         width: 180, //default 128
            //         height: 180,
            //         colorDark : "#000000",
            //         colorLight : "#ffffff",
            //         correctLevel : QRCode.CorrectLevel.H
            //     });
            // }
        
        const modalContainer = document.getElementById("modal-container");

        function addProfileModal(){
            modalContainer.innerHTML = profileModalHTML
            document.getElementById("lock-wallet").addEventListener("click",()=>{
                document.getElementById("modal-container").classList.add("hidden");
                logout()
            })
        
                document.getElementById("account-details-btn").addEventListener("click",()=>{
                    modalContainer.innerHTML = accountDetailsModalHTML
                    // generateQr(tale_wallet_address)

                    document.getElementById("tale_wallet_address").innerHTML = tale_wallet_address;
                    document.getElementById("view_on_algoscan").addEventListener("click",()=>{
                        window.open(`${ALGO_SCAN_ACCOUNT}/${tale_wallet_address}`)
                    })
        
                    document.getElementById("close-profile-modal").addEventListener("click",()=>{
                        addProfileModal();
                    })
        
                })
                document.getElementById("talewallet_support").addEventListener("click",()=>{
                    window.open(`${talewallet_url}/support`)
                  })
                document.getElementById("e-kyc").addEventListener("click",()=>{
                    window.open(`${talewallet_url}`)
                  })
              document.getElementById("view_on_algoscan").addEventListener("click",()=>{
                window.open(`${ALGO_SCAN_ACCOUNT}/${tale_wallet_address}`)
              })

            document
            .getElementById("close-profile-modal")
            .addEventListener("click", () => {
                modalContainer.classList.add("hidden");
            });
        }

        addProfileModal();
        

        const profileModal = document.getElementById("profile-modal")


    

      document
        .getElementById("profile-container")
        .addEventListener("click", () => {
            modalContainer.classList.toggle("hidden");
          
        });
        

      document.getElementById("wallet_div").innerHTML = `
            <div class="flex flex-col items-center gap-20">
            <div class = "flex justify-between items-center box-shadow-1 w-80p wallet-address-container">
                <div>
                    <img src="../images/ellipse.svg" class="w-40 h-40 object-contain" />
                </div>
                <div style=" overflow: hidden; text-overflow: ellipsis;" class="w-100 font-bold" id="tale_wallet_address">  ${tale_wallet_address}</div>
                <div  id="copy_to_clipboard"> <img src="../images/copy.png" alt="Copy Address" width="25" /> </div>
            </div>
                
                <div class="flex flex-col items-center">
                    <div class="relative z-10">
                        <img src="../images/algo.svg" class=" w-50 h-100object-contain" />
                    </div>
                    <div  id="wallet_balance" class="text-lg font-bold text-tale"> fetching ... </div>
                </div>
            <div class="flex gap-20 justify-center">
                <button class="btn primary-btn" id="buy-btn">Buy</button>
                <button class="btn hidden secondary-btn" id="sell-btn">Sell</button>
            </div>
            </div>
                
                `;
    document.getElementById("buy-btn").addEventListener("click",()=>{
        redirectToTalewalletWeb();
    })
    document.getElementById("sell-btn").addEventListener("click",()=>{
        redirectToTalewalletWeb();
    })
      var copybtn = document.getElementById("copy_to_clipboard");
      copybtn.addEventListener("click", function () {
        copyToClipboard(tale_wallet_address);
      });
    } else {
      createOrRecoverAccountUI();
    }
  });
}

async function askPassPhrase(password){
    // const encryptedData = await encrypt(password)
    // console.log(encryptedData)

    let passphrase;
    chrome.storage.local.get(["secretKey"], (res) => {
            
        
        
            
        console.log([1,2,3,4,5,6])
        const propertyValues = Object.values(JSON.parse(res.secretKey));
        passphrase =   algosdk.secretKeyToMnemonic(propertyValues).split(" ");
        var ciphertext = CryptoJS.AES.encrypt(
            JSON.stringify(passphrase),
            CryptoJS.SHA256(password).toString()
          ).toString();

          console.log(ciphertext)
        //   let bytes = CryptoJS.AES.decrypt(ciphertext, password);
        //   const decryptedData =
        //   bytes.toString(CryptoJS.enc.Utf8) &&
        //   JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        //   console.log(decryptedData)

        // console.log(passphrase)
        function getRandomNumber() {
            return Math.floor(Math.random() * 25) + 1;
          }
          
          let randomNumber1 = getRandomNumber();
          let randomNumber2 = getRandomNumber();
          let randomNumber3 = getRandomNumber();
    
          while (randomNumber1 === randomNumber2 || randomNumber2 === randomNumber3 || randomNumber1 === randomNumber3) {
            randomNumber1 = getRandomNumber();
            randomNumber2 = getRandomNumber();
            randomNumber3 = getRandomNumber();
          }

          document.getElementById('wallet_div').innerHTML = `
          <div class="flex flex-col gap-20">
          <div class="text-start">
              <button class="border-none" id ="back_to_password"> back</button>
          </div>
          <div>
              <span class="text-xl font-bold text-tale">
                  Enter your passphrase
              </span>
          </div>
          <div class="flex flex-col gap-20">
              <div class="flex flex-col gap-10 items-start">
                  <span class="font-bold"># ${randomNumber1}</span>
                  <div class="flex shadow-1 w-full  email-input-container">
                      <input type="text" class="border-none outline-none mt-10" placeholder="Passphrase no ${randomNumber1}" name="uname"
                          id="passphrase_1" required>
                  </div>
              </div>
              <div class="flex flex-col gap-10 items-start">
                  <span class="font-bold"># ${randomNumber2} </span>
                  <div class="flex shadow-1 w-full  email-input-container">
                      <input type="text" class="border-none outline-none mt-10" placeholder="Passphrase no ${randomNumber2}" name="uname"
                          id="passphrase_2" required>
                  </div>
              </div>
              <div class="flex flex-col gap-10 items-start">
                  <span class="font-bold"># ${randomNumber3} </span>
                  <div class="flex shadow-1 w-full  email-input-container">
                      <input type="text" class="border-none outline-none mt-10" placeholder="Passphrase no ${randomNumber3}" name="uname"
                          id="passphrase_3" required>
                  </div>
              </div>
          </div>
          <div class="text-warning" id ="pass-warning"></div>
          <button class="btn primary-btn" id="confirm_passphrase">
              Continue
          </button>
      </div>
          
          `
      document.getElementById("back_to_password").addEventListener("click",()=>{
        setUpPassword();
      })
      const inputpass1 = document.getElementById("passphrase_1")
      const inputpass2 = document.getElementById("passphrase_2")
      const inputpass3 = document.getElementById("passphrase_3")
      document.getElementById("confirm_passphrase").addEventListener("click",()=>{
        
          if(inputpass1.value === passphrase[randomNumber1-1] && inputpass2.value === passphrase[randomNumber2-1] &&  inputpass3.value === passphrase[randomNumber3-1]){
            
            chrome.storage.local.set({leftAt:"none"});
            chrome.storage.local.set({userCredentials:{password:CryptoJS.SHA256(password).toString(),encryptedPassphrase:ciphertext}},(res) =>{
                console.log(res);
            });
              getValues();
          }else{
              document.getElementById("pass-warning").innerHTML = `<span>wrong pass phrase</span>`
          }
      })

        
      });
}

const passwordSetUpDiv = ` 
  <div class="flex flex-col gap-40">

     <div class="font-bold text-tale text-xl">
       Setup Your Password
     </div>
     <div class="flex justify-start">
     <button class="border-none cursor-pointer" id="back-to-login">
           ${backUi}
     </button>
     </div>
    <div class="flex flex-col gap-20">
    <div class="flex flex-col items-start gap-10">
       <span class="font-semibold text-medium">
        Create password
       </span>
      <div class="flex shadow-1 w-full  email-input-container">
          <input type="password" class="border-none outline-none mt-10" placeholder="Enter your password here" name="uname"
            id="account_setup_password" required>
       </div>

    </div>
    <div class="flex flex-col items-start gap-10">
       <span class="font-semibold text-medium">
          Confirm password
        </span>
       <div class="flex shadow-1 w-full  email-input-container">
            <input type="password" class="border-none outline-none mt-10" placeholder="Confirm your password" name="uname"
            id="account_setup_repeat_password" required>
        </div>

    </div>
    <div class="text-warning" id="password_warning" ></div>
    <button class="primary-btn btn" id="confirm_password">
       Confirm password
    </button>
    </div>
  </div>`


function setUpPassword(){
    document.getElementById('wallet_div').innerHTML = passwordSetUpDiv;
    document.getElementById("back-to-login").addEventListener("click",logout)
    const pass = document.getElementById("account_setup_password");
    const repeatPass = document.getElementById("account_setup_repeat_password")
    const passwordWarning = document.getElementById("password_warning")
    console.log(document.getElementById("confirm_password"))
    document.getElementById("confirm_password").addEventListener("click",()=>{
        if(pass.value === repeatPass.value && pass.value.length < 8){
                passwordWarning.innerHTML=`<span>Password length must be atleast of 8 character</span>`
        }else if(pass.value !== repeatPass.value){
            passwordWarning.innerHTML=`<span>Password and repeat password does not match.</span>`
        }
        else {
            askPassPhrase(pass.value)
        }

    })
}

function setUpCustodianPassword(){
    document.getElementById('wallet_div').innerHTML = passwordSetUpDiv;
    const pass = document.getElementById("account_setup_password");
    const repeatPass = document.getElementById("account_setup_repeat_password")
    const passwordWarning = document.getElementById("password_warning")

    document.getElementById("confirm_password").addEventListener("click",()=>{
        if(pass.value === repeatPass.value && pass.value.length < 8){
                passwordWarning.innerHTML=`<span>Password length must be atleast of 8 character</span>`
        }else if(pass.value !== repeatPass.value){
            passwordWarning.innerHTML=`<span>Password and repeat password does not match.</span>`
        }
        else {
            savePassphraseToServer();
        }

    })
}

function downloadMnemonicFile(mnemonic) {
    const element = document.createElement("a");
    const file = new Blob([mnemonic], {
        type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = "tale_wallet_algorand_passphrase.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}

function recoverAccountFromPassphrase(mnemonic){
    var keys = algosdk.mnemonicToSecretKey(mnemonic);
    
        document.getElementById('wallet_div').innerHTML = passwordSetUpDiv;
    
        document.getElementById("back-to-login").addEventListener("click",logout)
    const pass = document.getElementById("account_setup_password");
    const repeatPass = document.getElementById("account_setup_repeat_password")
    const passwordWarning = document.getElementById("password_warning")
    console.log(document.getElementById("confirm_password"))
    document.getElementById("confirm_password").addEventListener("click",()=>{
        if(pass.value === repeatPass.value && pass.value.length < 8){
                passwordWarning.innerHTML=`<span>Password length must be atleast of 8 character</span>`
        }else if(pass.value !== repeatPass.value){
            passwordWarning.innerHTML=`<span>Password and repeat password does not match.</span>`
        }
        else {
            chrome.storage.local.set({tale_wallet_address: keys.addr}, function() {
            var ciphertext = CryptoJS.AES.encrypt(
                JSON.stringify(mnemonic || ""),
                CryptoJS.SHA256(pass.value).toString()
              ).toString();

              chrome.storage.local.set({userCredentials:{password:CryptoJS.SHA256(pass.value).toString(),encryptedPassphrase:ciphertext}},(res) =>{
                getValues();
            });
        })
            
        }
    });

}

function requestOtp(email) {
    if(!validateEmail(email)){
        document.getElementById("sb_rb_error").innerHTML="<span>Email id is expected</span>"
    }
    else{
    chrome.storage.local.set({leftAt:"none"})
    // getValues()
    let config = {
        
        method:"post",
        headers:{
            "X-App-Token": app_token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email:email
        })
    }
   
    fetch(`${NFTVERSE_DEV_API}/otp/send?type=login`,config).then(
        (res) =>{
            document.getElementById('email_address').disabled = true;
            document.getElementById('request_otp_btn').style.display="none";
            document.getElementById("otp-container").classList.remove("hidden");
            document.getElementById("submit_otp_btn").style.display = "block"
            document.getElementById("sb_rb_error").innerHTML=""
        }
        )
    }
}

 function setUpTaleWallet(){
    chrome.storage.local.get(["authToken"],(res) =>{
    let config = {
        
        method:"post",
        headers:{
            "X-Auth-Token": res.authToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            
                blockchain: "ALGORAND",
                wallet: "TALEWALLET",
                marketplaceAddress: 0,
            
        })
    }
     fetch(`${BLOCKCHAIN_SERVICE}/user/blockchain/wallet/setup`,config)
     .then(res => res.json())
     .then(res =>{
        chrome.storage.local.set({tale_wallet_address: res.address}, function() {
            document.getElementById('wallet_div').innerHTML  = '';
            getValues()
        });
     })
     .catch(rej => console.log(rej))
})
    
}

async function loginWithOtp(){
    chrome.storage.local.get(["authToken"],(res) =>{
    let config = {
        
        method:"get",
        headers:{
            "X-Auth-Token": res.authToken ,
            "Content-Type": "application/json",
        }
    }

    fetch(`${BLOCKCHAIN_SERVICE}/user/blockchain/account?blockchain=ALGORAND`,config)
    .then(res => res.json())
    .then(res => {

        const talewallet = res?.filter(wallet => wallet.wallet ==="TALEWALLET");
        if(talewallet?.length === 0){
          setUpTaleWallet();
        }
        else{
        
            chrome.storage.local.set({tale_wallet_address: talewallet[0].address}, function() {
                document.getElementById('wallet_div').innerHTML  = '';
                passWordSetupforOtpLogin();
                // getValues()
            });
        }
    }
    )
    .catch(rej => document.getElementById("sb_rb_error").innerHTML="<span>Having trouble getting account try again later</span>" )

    

})


}
function passWordSetupforOtpLogin(){
    document.getElementById('wallet_div').innerHTML = passwordSetUpDiv;
    
    document.getElementById("back-to-login").addEventListener("click",logout)
const pass = document.getElementById("account_setup_password");
const repeatPass = document.getElementById("account_setup_repeat_password")
const passwordWarning = document.getElementById("password_warning")
console.log(document.getElementById("confirm_password"))
document.getElementById("confirm_password").addEventListener("click",()=>{
    if(pass.value === repeatPass.value && pass.value.length < 8){
            passwordWarning.innerHTML=`<span>Password length must be atleast of 8 character</span>`
    }else if(pass.value !== repeatPass.value){
        passwordWarning.innerHTML=`<span>Password and repeat password does not match.</span>`
    }
    else {
          chrome.storage.local.set({userCredentials:{password:CryptoJS.SHA256(pass.value).toString(),encryptedPassphrase:""}},(res) =>{
            getValues();
       
    })
        
    }
});
}


function verifyOtp(email,otp){
 if(!otp){
    document.getElementById("sb_rb_error").innerHTML="<span>Otp is expected</span>"
 }else{
    let config = {
        
        method:"post",
        headers:{
            "X-App-Token": app_token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email:email,
            otp:otp
        })
    }
    fetch(`${NFTVERSE_DEV_API}/otp/verify?type=login`,config)
    .then((res) =>  res.json())
    .then(res => chrome.storage.local.set({authToken:res.authToken},()=>{
            loginWithOtp();
    }))
    .catch(rej => document.getElementById("sb_rb_error").innerHTML="<span>Wrong otp</span>" )
 }
}



function afterSignupAuccess(data) {
    //todo:
    document.getElementById('submit_rebuttal_div').innerHTML  = "<p style='color: green; font-weight: bold;'>Rebuttal submitted Successfully!</p>";
}

function setAccountWithEmail(){
    // console.log(mnemonic)
    document.getElementById('wallet_div').innerHTML  =
        `       <div class="flex flex-col items-center gap-10">
            <div class="text-centre">
                    <img src="../images/talewallet.png" class="avatar" />

                    </div>
                    <label for="uname"><b>Enter your email address</b></label>
                    <div class="flex shadow-1 w-full  email-input-container">
                    <input type="text" class = "border-none outline-none mt-10" placeholder="Enter your email" name="uname" id="email_address" required>
            </div>  
            <div class="flex shadow-1 w-full hidden  email-input-container" id="otp-container">
                    <input type="text" class = "border-none outline-none mt-10 " placeholder="Enter OTP received on your mail" name="uname" id="input_otp" required>
            </div>       
        <span id="sb_rb_error" style="color:red"></span>
                    <button type="submit"  id="request_otp_btn" class="btn primary-btn mt-10">Request Otp</button>
                    <button type="submit"  id="submit_otp_btn" class="btn primary-btn mt-10 hidden">Submit Otp</button>
        <div>In future you will be able to access your account using this email and OTP</div>
                </div>`;
    // chrome.storage.local.set({leftAt:"email_verification"})
    const requestOtpBtn = document.getElementById('request_otp_btn');
    const submitOtpBtn = document.getElementById("submit_otp_btn");
    const email = document.getElementById('email_address')
    const inputOtp = document.getElementById("input_otp")
    // onClick's logic below:
    if(requestOtpBtn) {
        requestOtpBtn.addEventListener('click', function () {
            requestOtp(email.value);
        });
    }

    submitOtpBtn.addEventListener("click",() =>verifyOtp(email.value,inputOtp.value))
    //todo: take users email and save this to server
}





function accountSetup(){
    document.getElementById(
        "wallet_div"
      ).innerHTML = `<div class="manage-account-details">
                <div>
                  <img src="../images/talewallet.png" alt="Avatar" class="avatar">
                 </div>
                 <div class="font-bold text-medium">Let Tale wallet manage your passphrase and get 1 Algo in your wallet to get started</div>
                 <div class=" flex items-center gap-10 ">
                     <input type="checkbox"  id="consent_checkbox" name="remember">
                      <span class="font-semibold font-14 text-start "> I want Tale Wallet to manage my passphrase </span>
                 </div>
                 
              </div>
              <div class=" manage-account-details mt-20">
              <button class="btn secondary-btn" type="submit" id="download_passphrase">Download Passphrase</button>
              <button class="btn primary-btn" disabled id="noncustodian_confirmation">No, i want to manage my passphrase.</button>
              <button class="btn primary-btn" type="submit"  id="confirm_btn">Confirm</button>
                  
              </div>
              </div>
              </div>`;
  
      const consent_checkbox = document.getElementById("consent_checkbox");
      var lbtn = document.getElementById("confirm_btn");
      lbtn.hidden = !consent_checkbox.checked;
      lbtn.addEventListener("click", function () {
        // setUpCustodianPassword();
        setAccountWithEmail();
      });
  
      var ncbtn = document.getElementById("noncustodian_confirmation");
  
      ncbtn.addEventListener("click", function () {
        // chrome.storage.local.set({leftAt:"none"})
        // getValues();
        
         setUpPassword()
      });
      var dbtn = document.getElementById("download_passphrase");
      dbtn.addEventListener("click", function () {
        ncbtn.disabled = false;
        let keys = algosdk.generateAccount();
         chrome.storage.local.set({ leftAt: "account_creation" });
        console.log(keys.sk);
        chrome.storage.local.set({ secretKey: JSON.stringify(keys.sk) },()=>{
            downloadMnemonicFile(algosdk.secretKeyToMnemonic(keys.sk));
        });

        chrome.storage.local.set(
          { tale_wallet_address: keys.addr },
          function () {
            // console.log("Value is set to " + keys.addr);
            // accountSetup(keys.sk);
        
          }
        );
        
      });
      consent_checkbox.addEventListener("change", (event) => {
        lbtn.hidden = !consent_checkbox.checked;
        ncbtn.hidden = consent_checkbox.checked;
        dbtn.hidden = consent_checkbox.checked;
      });
}
function createNewAccount(){
//   let keys = algosdk.generateAccount();
//   chrome.storage.local.set({ leftAt: "account_creation" });
//   console.log(keys.sk);
//   chrome.storage.local.set({ secretKey: JSON.stringify(keys.sk) });

//   chrome.storage.local.set({ tale_wallet_address: keys.addr }, function () {
//     // console.log("Value is set to " + keys.addr);
//     accountSetup(keys.sk)
//   });
}

function recoverAccountUI() {
    document.getElementById('wallet_div').innerHTML  =
        `        <div class="flex flex-col gap-20 my-20">
                    <div class="flex flex-col">
                            <div>
                                <img src="../images/talewallet.png" alt="Avatar" class="avatar"/>
                            </div>
                    </div>
                    <label for="uname"><b>Enter your passphrase</b></label>
                    <div class="flex flex-col shadow-1 w-full  email-input-container">
                      <input type="text" class="border-none outline-none underline-none" placeholder="Enter your passphrase or seedphrase" name="uname" id="account_passphrase" required>
                   </div>
                   <span id="sb_rb_error"></span>
                    <button class="btn primary-btn" type="submit" id="sbt_reb_btn">Submit</button>
                </div>`;
    var link = document.getElementById('sbt_reb_btn');
    // onClick's logic below:
    if(link) {
        link.addEventListener('click', function () {
            recoverAccountFromPassphrase(document.getElementById('account_passphrase').value);
        });
    }
}

function sendOTP(value) {
    console.log("send OTP");
}

function showLoginUIUsingOTP(){
    document.getElementById('wallet_div').innerHTML  =
        `<div class="flex flex-col gap-10">
        <div>
        <img src="../images/talewallet.png" alt="Avatar" class="avatar">
        </div>
        <div class="flex flex-col items-center">
            <span class = "font-bold text-2xl text-tale">Welcome</span>
            <span class = "font-semibold text-lg">Login with OTP</span>
        </div>
        <div class="flex flex-col gap-20 items-start">
                    <label  for="uname"><b>Enter your email address</b></label>
                    <div class="flex shadow-1 w-full  email-input-container">
                    <span><img src="../images/mail.svg" class=""/></span>
                    <input type="text" class= "border-none outline-none" placeholder="Enter your email" name="uname" id="otp_email_address" required>
                    </div>
                    <div class="w-full">
                    <span id="sb_rb_error"></span>
                    <button class="btn primary-btn" type="submit" id="sbt_email_otp_btn">Continue</button>
        </div>
        
        <div class="text-center w-full">You will get an OTP on this email</div>
        </div>`;
    var link = document.getElementById('sbt_email_otp_btn');
    // onClick's logic below:
    if(link) {
        link.addEventListener('click', function () {
            sendOTP(document.getElementById('otp_email_address').value);
        });
    }
}
function alreadyHaveAccount(){
    document.getElementById('wallet_div').innerHTML=`<div class="imgcontainer">
    <img src="../images/talewallet.svg" alt="Avatar" class="avatar">
 </div>
 
 <div class="flex flex-col justify-end gap-20 mt-20">
    <button class="btn primary-btn" id='login_using_email'>Login with Otp</button>
    <button class="btn secondary-btn" id='recover_btn' >Recover with passphrase</div>
 </div>`

 var cbtn = document.getElementById('login_using_email');

    // onClick's logic below:
    cbtn.addEventListener('click', function() {
        setAccountWithEmail();
    });
    var rctn = document.getElementById('recover_btn');
    rctn.addEventListener('click', function() {
        recoverAccountUI();
    });
}
function createOrRecoverAccountUI() {
    document.getElementById('wallet_div').innerHTML  =`<div class="imgcontainer">
                   <img src="../images/talewallet.svg" alt="Avatar" class="avatar">
                </div>
                
                <div class="flex flex-col justify-end gap-20 mt-20">
                <div class="font-bold text-2xl text-tale">
                Welcome
                </div>
                <div class ="create-account-actions">
                   <button class="btn primary-btn" type="submit" id="create_btn">Create Account</button>
                  <button class="btn secondary-btn" type="submit" id="already_have_account">Already have Account</button>
               </div>
               </div>`;

    
    
    document.getElementById("already_have_account").addEventListener("click",alreadyHaveAccount)


    var lbtn = document.getElementById('create_btn');
    lbtn.addEventListener('click', function() {
        // createNewAccount();
        accountSetup()
    });

}

function postAPICall(callback, url, dataString) {
    var token = "";
    console.log(dataString);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                callback(data);
            } else {
                console.log(xhr.response);
                var data = JSON.parse(xhr.responseText)
                callback(data);
            }
        }
    }
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    chrome.storage.local.get(["authToken"], function(result) {
        var token = result.authToken;
        if(token){
            xhr.setRequestHeader("X-Auth-Token", token);
            xhr.send(dataString);
        } else {
            xhr.setRequestHeader("X-Auth-Token", "aee313b768ac38765432ba68766dd2f0091e5b9");
            xhr.send(dataString);
        }
    })


};

function getAPICall(callback, url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                callback(data);
            } else {
                console.log(xhr.response);
                var data = JSON.parse(xhr.responseText);
                callback(data); 
            }
        }
    }
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    xhr.open('GET', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    chrome.storage.local.get(["authToken"], function(result) {
        var token = result.authToken;
        if(token){
            xhr.setRequestHeader("X-Auth-Token", token);
            xhr.send();
        } else {
            xhr.setRequestHeader("X-App-Token", "aee313b768ac38765432ba68766dd2f0091e5b9");
            xhr.send();
        }
    })
};
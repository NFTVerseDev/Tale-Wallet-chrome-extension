import { pinta_cloud } from "./config.js";

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
                 const propertyValues = Object.values(JSON.parse(res.secretKey));
                // savePassphraseToServer(algosdk.secretKeyToMnemonic(propertyValues));
                accountSetup(propertyValues);
              });
        }
        else{
            getClient();
             getValues();
        }
    })
    
    // getValues();
    

    
});


function logout() {
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
        document.getElementById('wallet_div').innerHTML = '';
        document.getElementById('tlw_logout').innerHTML = '';
        document.getElementById('wallet_asset_div').innerHTML = '';
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
        

        document.getElementById('wallet_balance').innerHTML  = amount;
        return amount;
    })().catch((e) => {
        console.log(e);
        return 0;
    });
}



const fetchAssetDetails= async (url) =>{

 const response = await fetch(url)
 const data = await response.json();
 console.log(data)
 return data


}

async function showAssets(accountInfo){
    if(accountInfo["created-assets"] === undefined){
        document.getElementById('wallet_asset_div').innerHTML  = '<div class="container" style="background-color:#f1f1f1; line-height: 2">No asset found</div>';

    } else {
        var c  = `<div class="font-bold text-medium flex justify-between  relative  ">
                     <button class="activity-button activity-selected relative z-10" id="show-Nfts">NFTs </button>
                     <button class="activity-button relative left-10">Token </button>
                     <button class="activity-button">Activities </button>
                     <div class="activity-border"></div>
                  </div>
                    <div class=" flex flex-wrap justify-center gap-20"> `;
        console.log(accountInfo['created-assets'])
        var assetobj = accountInfo['created-assets']
        for (const item in assetobj) {
            try {
            const asset = await fetchAssetDetails(assetobj[item]?.params?.url);
            
            console.log(`key = ${item}, value = ${assetobj[item]["assetname"]}`);
            c = c + `<a href="https://testnet.talewallet.com/asset/${assetobj[item]?.index}" target="_blank">
            <div class="flex flex-col asset-container" >
            <div>
                <img src= "${pinta_cloud}/${asset?.ipfsHash}" class ="asset-image" />
            </div>
            <div class="break-word"> ${assetobj[item]?.params?.name} </div>
            </div>
            </a>`;
        }catch(error){
                    console.log(error)
            }
        }
        document.getElementById('wallet_asset_div').innerHTML = c +"</div>";
    }
}
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
    var tickUI =  ` <li class="transparencyli">
                            <span class="checkmark">
                           <div class="checkmark_circle"></div>
                            <div class="checkmark_stem"></div>
                           <div class="checkmark_kick"></div>
                           </span>\n`;
    document.getElementById('copy_to_clipboard').innerHTML = tickUI + 'Address copied to clipboard'
}


function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


function getValues() {
    chrome.storage.local.get(["tale_wallet_address"], async function (result) {
        
        console.log('Value currently is ', result);
        var tale_wallet_address = result.tale_wallet_address;
        console.log("wallet Address: " + tale_wallet_address);
        let balance = getBalance(tale_wallet_address)
        if (tale_wallet_address) {
            //show account balance
            document.getElementById('wallet_div').innerHTML = '<span style="margin-top: 10px;"><img src="../images/algorand.png" alt="Avatar" class="avatar1"><br />' +
                '<div style="font-size: 14px; overflow: hidden; text-overflow: ellipsis;" id="tale_wallet_address">' + tale_wallet_address + '</div><br />' +
                '<div style="font-size: 14px;" id="copy_to_clipboard"> <img src="../images/copy.png" alt="Copy Address" width="25" /> </div><br /><br />' +
                '<div style="font-size: 14px;" id="wallet_balance"> fetching ... </div><br /><br />';

            document.getElementById('tlw_logout').innerHTML = '<a  id="logout_btn">Logout</a></span>';
            var lbtn = document.getElementById('logout_btn');
            lbtn.addEventListener('click', function () {
                logout();
            });
            var copybtn = document.getElementById('copy_to_clipboard');
            copybtn.addEventListener('click', function () {
                copyToClipboard(tale_wallet_address);
            });
        } else {
            createOrRecoverAccountUI();
        }
    });
}

function askPassPhrase(password){

    let passphrase;
    chrome.storage.local.get(["secretKey"], (res) => {
            
            
        console.log([1,2,3,4,5,6])
        const propertyValues = Object.values(JSON.parse(res.secretKey));
        passphrase =   algosdk.secretKeyToMnemonic(propertyValues).split(" ");
        
      });


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
            <span># no${randomNumber1}</span>
            <div class="flex shadow-1 w-full  email-input-container">
                <input type="text" class="border-none outline-none mt-10" placeholder="Repeat your password to confirm" name="uname"
                    id="passphrase_1" required>
            </div>
        </div>
        <div class="flex flex-col gap-10 items-start">
            <span># no${randomNumber2}</span>
            <div class="flex shadow-1 w-full  email-input-container">
                <input type="text" class="border-none outline-none mt-10" placeholder="Repeat your password to confirm" name="uname"
                    id="passphrase_2" required>
            </div>
        </div>
        <div class="flex flex-col gap-10 items-start">
            <span># no${randomNumber3}</span>
            <div class="flex shadow-1 w-full  email-input-container">
                <input type="text" class="border-none outline-none mt-10" placeholder="Repeat your password to confirm" name="uname"
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
const inputpass1 = document.getElementById("passphrase_1")
const inputpass2 = document.getElementById("passphrase_2")
const inputpass3 = document.getElementById("passphrase_3")
document.getElementById("confirm_passphrase").addEventListener("click",()=>{
    if(inputpass1 === passphrase[randomNumber1+1] && inputpass2 === passphrase[randomNumber2+1] &&  inputpass3 === passphrase[randomNumber3+1]){
        getValues();
    }else{
        document.getElementById("pass-warning").innerHTML = `<span>wrong pass phrase</span>`
    }
})

}

function setUpPassword(){
    document.getElementById('wallet_div').innerHTML = `
    <div class="flex flex-col gap-40">
    
    <div class="font-bold text-tale text-xl">
        Setup Your Password
    </div>
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
            Repeat password
        </span>
        <div class="flex shadow-1 w-full  email-input-container">
            <input type="password" class="border-none outline-none mt-10" placeholder="Repeat your password to confirm" name="uname"
                id="account_setup_repeat_password" required>
        </div>

    </div>
    <div class="text-warning" id="password_warning" ></div>
    <button class="primary-btn btn" id="confirm_password">
        Confirm password
    </button>
</div>
    `
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
    chrome.storage.local.set({tale_wallet_address: keys.addr}, function() {
        document.getElementById('wallet_div').innerHTML  = '';
        getValues()
    });

}

function signupAndSaveCredentials(email, mnemonic, address) {
    var api_url = 'https://bs-dev.api.onnftverse.com/v1/custodian/wallet/user/create';
    var data_string = {
        email: email,
        seedPhrase: mnemonic,
        address: address,
        blokchain: 'ALGORAND'
    };
    // postAPICall(api_url, JSON.stringify(data_string));
    if(!validateEmail(email)){
        document.getElementById("sb_rb_error").innerHTML="<span>Email id is expected</span>"
    }
    else{
    chrome.storage.local.set({leftAt:"none"})
    getValues()
    }
}
function afterSignupAuccess(data) {
    //todo:
    document.getElementById('submit_rebuttal_div').innerHTML  = "<p style='color: green; font-weight: bold;'>Rebuttal submitted Successfully!</p>";
}

function savePassphraseToServer(mnemonic, address){
    console.log(mnemonic)
    document.getElementById('wallet_div').innerHTML  =
        `       <div class="flex flex-col items-center gap-10">
            <div class="text-centre">
                    <img src="../images/talewallet.svg" class="avatar" />

                    </div>
                    <label for="uname"><b>Enter your email address</b></label>
                    <div class="flex shadow-1 w-full  email-input-container">
                    <input type="text" class = "border-none outline-none mt-10" placeholder="Enter your email" name="uname" id="email_address" required>
            </div>        
        <span id="sb_rb_error" style="color:red"></span>
                    <button type="submit"  id="sbt_email_btn" class="btn primary-btn mt-10">Submit</button>
        <div>In future you will be able to access your account using this email and OTP</div>
                </div>`;
    chrome.storage.local.set({leftAt:"email_verification"})
    var link = document.getElementById('sbt_email_btn');
    // onClick's logic below:
    if(link) {
        link.addEventListener('click', function () {
            signupAndSaveCredentials(document.getElementById('email_address').value, mnemonic, address);
        });
    }
    //todo: take users email and save this to server
}
function accountSetup(sk){
    document.getElementById(
        "wallet_div"
      ).innerHTML = `<div class="manage-account-details">
                <div>
                  <img src="../images/talewallet.svg" alt="Avatar" class="avatar">
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
        savePassphraseToServer(algosdk.secretKeyToMnemonic(sk));
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
        downloadMnemonicFile(algosdk.secretKeyToMnemonic(sk));
      });
      consent_checkbox.addEventListener("change", (event) => {
        lbtn.hidden = !consent_checkbox.checked;
        ncbtn.hidden = consent_checkbox.checked;
        dbtn.hidden = consent_checkbox.checked;
      });
}
function createNewAccount(){
  let keys = algosdk.generateAccount();
  chrome.storage.local.set({ leftAt: "account_creation" });
  console.log(keys.sk);
  chrome.storage.local.set({ secretKey: JSON.stringify(keys.sk) });

  chrome.storage.local.set({ tale_wallet_address: keys.addr }, function () {
    // console.log("Value is set to " + keys.addr);
    accountSetup(keys.sk)
  });
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
                      <input type="text" class="border-none underline-none" placeholder="Enter your passphrase or seedphrase" name="uname" id="account_passphrase" required>
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
                  <button class="btn secondary-btn" type="submit" id="recover_btn">Recover Account</button>
               </div>
        
                <div class="container" >
                   Already have Tale Wallet Account? <br /> <a id="login_using_email">Login using email & OTP</a>
               </div>
               
               </div>`;

    var cbtn = document.getElementById('login_using_email');

    // onClick's logic below:
    cbtn.addEventListener('click', function() {
        showLoginUIUsingOTP();
    });
    var rctn = document.getElementById('recover_btn');

    // onClick's logic below:
    rctn.addEventListener('click', function() {
        recoverAccountUI();
    });
    var lbtn = document.getElementById('create_btn');
    lbtn.addEventListener('click', function() {
        createNewAccount();
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
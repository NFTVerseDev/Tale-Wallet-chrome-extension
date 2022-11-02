document.addEventListener('DOMContentLoaded', function() {
    client = getClient();
    getValues();
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
    const client = new algosdk.Algod(token, server, port);
    (async () => {
        let accountDet = await client.accountInformation(addr);
        // setting balance to state
        console.log(accountDet);
        let amount =  accountDet.amount / 1000000
        console.log( amount)
        showAssets(accountDet)
        document.getElementById('wallet_balance').innerHTML  = amount;
        return amount;
    })().catch((e) => {
        console.log(e);
        return 0;
    });
}
function showAssets(accountInfo){
    if(accountInfo["thisassettotal"] === undefined){
        document.getElementById('wallet_asset_div').innerHTML  = '<div class="container" style="background-color:#f1f1f1; line-height: 2">No asset found</div>';

    } else {
        var c  = '<div class="container" style="text-align: left">Assets</div> <br />';
        console.log(accountInfo['thisassettotal'])
        var assetobj = accountInfo['thisassettotal']
        for (const item in assetobj) {
            console.log(`key = ${item}, value = ${assetobj[item]["assetname"]}`);
            c = c + '<div style="background-color:#f1f1f1; margin-top: 5px; padding: 10px; text-align: left"><a href="https://testnet.talewallet.com/asset/'+item+'" target="_blank">'+assetobj[item]["assetname"]+'</a></div>';
        }
        document.getElementById('wallet_asset_div').innerHTML = c;
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
    var tickUI =  ' <li class="transparencyli">\n' +
        '                    <span class="checkmark">\n' +
        '                    <div class="checkmark_circle"></div>\n' +
        '                    <div class="checkmark_stem"></div>\n' +
        '                    <div class="checkmark_kick"></div>\n' +
        '                    </span>\n';
    document.getElementById('copy_to_clipboard').innerHTML = tickUI + 'Address copied to clipboard'
}

function getValues() {
    chrome.storage.local.get(["tale_wallet_address"], async function (result) {
        console.log('Value currently is ' + result);
        var tale_wallet_address = result.tale_wallet_address;
        console.log("wallet Address: " + tale_wallet_address);
        let balance = getBalance(tale_wallet_address)
        if (tale_wallet_address) {
            //show account balance
            document.getElementById('wallet_div').innerHTML = '<span style="margin-top: 10px;"><img src="../images/algorand.png" alt="Avatar" class="avatar1"><br />' +
                '<div style="font-size: 14px; overflow: hidden; text-overflow: ellipsis;" id="tale_wallet_address">' + tale_wallet_address + '</div><br />' +
                '<div style="font-size: 14px;" id="copy_to_clipboard"> <img src="../images/copy.png" alt="Copy Address" width="25" /> </div><br /><br />' +
                '<div style="font-size: 14px;" id="wallet_balance"> fetching ... </div><br /><br />';

            document.getElementById('tlw_logout').innerHTML = '<a id="logout_btn">Logout</a></span>';
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
    getValues()
}
function afterSignupAuccess(data) {
    //todo:
    document.getElementById('submit_rebuttal_div').innerHTML  = "<p style='color: green; font-weight: bold;'>Rebuttal submitted Successfully!</p>";
}

function savePassphraseToServer(mnemonic, address){
    console.log(mnemonic)
    document.getElementById('wallet_div').innerHTML  =
        '        <div class="container">\n' +
        '            <label for="uname"><b>Enter your email address</b></label>\n' +
        '            <input type="text" placeholder="Enter your email" name="uname" id="email_address" required>\n' +
        '<span id="sb_rb_error"></span>'+
        '            <button type="submit" id="sbt_email_btn">Submit</button>\n' +
        '<div>In future you will be able to access your account using this email and OTP</div>'+
        '        </div>';
    var link = document.getElementById('sbt_email_btn');
    // onClick's logic below:
    if(link) {
        link.addEventListener('click', function () {
            signupAndSaveCredentials(document.getElementById('email_address').value, mnemonic, address);
        });
    }
    //todo: take users email and save this to server
}

function createNewAccount(){
    let keys = algosdk.generateAccount();
    console.log(keys)
    chrome.storage.local.set({tale_wallet_address: keys.addr}, function() {
        console.log('Value is set to ' + keys.addr);
        document.getElementById('wallet_div').innerHTML =
            '<div style="float: right;margin-top: 10px;">' +
            '<img src="../images/algorand.png" alt="Avatar" class="avatar1"><br />' +
            '<span style="font-size: 14px;"> Your Passphrase : '+algosdk.secretKeyToMnemonic(keys.sk)+'</span><br />' +
            '\n' +
            '            <button type="submit" id="download_passphrase">Download Passphrase</button>\n' +
            '        </div>\n' +
            '<div></div></div>' +
            '\n' +
            '<div>Let Tale wallet manage your passphrase and get 1 Algo in your wallet to get started</div><br />'+
            '            <div><label>\n' +
            '                <input type="checkbox" checked="checked" name="remember"> I want Tale Wallet to manage my passphrase\n' +
            '            </label></div>\n' +
            '            <button type="submit" id="confirm_btn">Confirm</button>\n' +
            '        </div>\n' +
            '</div>' +
            '<div><a id="noncustodian_confirmation">No, I will manage passphrase my self. I am aware that if I lose this passphrase, I will lose all my assets.</a></div>';
        var lbtn = document.getElementById('confirm_btn');
        lbtn.addEventListener('click', function() {
            savePassphraseToServer(algosdk.secretKeyToMnemonic(keys.sk));
        });
        var ncbtn = document.getElementById('noncustodian_confirmation');
        ncbtn.addEventListener('click', function() {
           getValues();
        });
        var dbtn = document.getElementById('download_passphrase');
        dbtn.addEventListener('click', function() {
            downloadMnemonicFile(algosdk.secretKeyToMnemonic(keys.sk));
        });
    });
}

function recoverAccountUI() {
    document.getElementById('wallet_div').innerHTML  =
        '        <div class="container">\n' +
        '            <label for="uname"><b>Enter your passphrase</b></label>\n' +
        '            <input type="text" placeholder="Enter your passphrase or seedphrase" name="uname" id="account_passphrase" required>\n' +
        '<span id="sb_rb_error"></span>'+
        '            <button type="submit" id="sbt_reb_btn">Submit</button>\n' +
        '        </div>';
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
        '        <div class="container">\n' +
        '            <label for="uname"><b>Enter your email address</b></label>\n' +
        '            <input type="text" placeholder="Enter your email" name="uname" id="otp_email_address" required>\n' +
        '<span id="sb_rb_error"></span>'+
        '            <button type="submit" id="sbt_email_otp_btn">Submit</button>\n' +
        '<div>You will get an OTP on this email</div>'+
        '        </div>';
    var link = document.getElementById('sbt_email_otp_btn');
    // onClick's logic below:
    if(link) {
        link.addEventListener('click', function () {
            sendOTP(document.getElementById('otp_email_address').value);
        });
    }
}

function createOrRecoverAccountUI() {
    document.getElementById('wallet_div').innerHTML  ='<div class="imgcontainer">\n' +
        '            <img src="../images/talewallet.png" alt="Avatar" class="avatar">\n' +
        '        </div>\n' +
        '\n' +
        '            <button type="submit" id="create_btn">Create Account</button>\n' +
        '        </div>\n' +
        '\n' +
        '            <button type="submit" id="recover_btn">Recover Account</button>\n' +
        '        </div>\n' +
        '\n' +
        '        <div class="container" style="background-color:#f1f1f1; line-height: 2">\n' +
        '            Already have Tale Wallet Account? <br /> <a id="login_using_email">Login using email & OTP</a>\n' +
        '        </div>';

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
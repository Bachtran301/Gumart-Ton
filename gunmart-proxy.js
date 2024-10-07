const axios = require('axios');
const fs = require('fs');
const path = require('path');
const async = require('async');
const readline = require('readline');
const colors = require('colors');
const queryPath = path.join(__dirname, 'data.txt');
const queryData = fs.readFileSync(queryPath, 'utf8').trim().split('\n');

console.clear();
console.log(`
██████╗ ██╗   ██╗████████╗██╗ ██████╗ ██████╗  ██████╗ ██╗      
██╔══██╗██║   ██║╚══██╔══╝██║██╔════╝██╔═══██╗██╔═══██╗██║      
██████╔╝██║   ██║   ██║   ██║██║     ██║   ██║██║   ██║██║      
██╔═══╝ ██║   ██║   ██║   ██║██║     ██║   ██║██║   ██║██║      
██║     ╚██████╔╝   ██║   ██║╚██████╗╚██████╔╝╚██████╔╝███████╗ 
╚═╝      ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═════╝  ╚══════╝ 
        `.cyan);
console.log('[+] Welcome & Enjoy Sir !'.green.bold);
console.log('[+] Error? PM Telegram [https://t.me/NothingYub]'.red.bold);

// 45 minutes
const timeCountDown = 45;

const processQuery = async (query_id, isTodoTask) => {
    query_id = query_id.replace(/[\r\n]+/g, '');
    const user_id_match = query_id.match(/user=%7B%22id%22%3A(\d+)/);
    if (!user_id_match) {
        console.error('Could not find user_id in query_id'.red);
        return;
    }

    const payload = {
        mode: null,
        ref_id: '6269851518',
        telegram_data: query_id
    };

    const config = {
        method: 'post',
        url: 'https://api.gumart.click/api/login',
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "access-control-allow-origin": "*",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Origin": "https://d2kpeuq6fthlg5.cloudfront.net",
            "Referer": "https://d2kpeuq6fthlg5.cloudfront.net/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        },
        data: payload,
    };

    const home = async (authorization) => {

        const homeConfig = {
            method: 'get',
            url: 'https://api.gumart.click/api/home',
            headers: {
                ...config.headers,
                authorization: authorization
            },
        };

        try {
            return await axios(homeConfig);
        } catch (error) {
            console.error('Error claiming ads'.red);
        }

        return null;
    };

    const claimMint = async (authorization) => {
        const claimConfig = {
            method: 'post',
            url: 'https://api.gumart.click/api/claim',
            headers: { ...config.headers, authorization },
        };

        try {
            const resClaim = await axios(claimConfig);
            console.log('Claim Successful!'.green.bold);
            console.log("[ Claim Value ]".cyan, resClaim.data.data.claim_value.toString().yellow);
            console.log("[ Balance Value ]".cyan, resClaim.data.data.balance.toString().yellow);
        } catch (error) {
            console.error('Cannot claim'.red);
        }
    };

    const getTask = async (authorization) => {
        const getTaskConfig = {
            method: 'get',
            url: 'https://api.gumart.click/api/missions',
            headers: { ...config.headers, authorization },
        };

        const startTask = (id) => {
            return {
                method: 'post',
                url: `https://api.gumart.click/api/missions/${id}/start`,
                headers: { ...config.headers, authorization },
            }
        }

        const claimTask = (id) => {
            return {
                method: 'post',
                url: `https://api.gumart.click/api/missions/${id}/claim`,
                headers: { ...config.headers, authorization },
            }
        }

        try {
            const allTask = await axios(getTaskConfig);
            const { missions, tasks } = allTask.data.data

            const todoTask = async (type) => {
                const keyType = Object.keys(type);
                for (let i = 0; i < keyType.length; i++) {
                    const item = keyType[i];
                    for (let j = 0; j < type[item].length; j++) {
                        const itemTask = type[item][j]
                        if(itemTask.status !== "finished"){
                            if (itemTask.status === 'startable') {
                                try{
                                    const resStartTask = await axios(startTask(itemTask.id));
                                    const { title } = resStartTask.data.data;
                                    console.log("Started task: ".green, title.yellow);
                                }catch{
                                    console.log("Cannot start task".red, itemTask.title.yellow);
                                }
                            } else if (itemTask.status === "claimable") {
                                try{
                                    const resClaimTask = await axios(claimTask(itemTask.id));
                                    const { title } = resClaimTask.data.data;
                                    console.log(`Task: ${title} has been completed!`.green.bold);
                                }catch{
                                    console.log("Error claiming task: ".red, itemTask.title.yellow);
                                }
                            }
                        }
                    }
                }
            }
            
            console.log("====> Starting tasks from Mission tab <====".blue);
            await todoTask(missions);
            console.log("====> Starting tasks from Task tab <====".blue);
            await todoTask(tasks);
            
            console.log("=====> Task completed :D".green);

        } catch (error) {
            console.error('Error performing tasks.'.red);
        }
    };

    try {
        const response = await axios(config);
        const data = response.data.data;
        const { access_token, type_token, user } = data;
        const authorization = type_token + " " + access_token;
        const homeData = await home(authorization);
        const { balance_text, friend_boost, earned_amount, mint_speed, vip_boost, premium_boost } = homeData.data.data

        console.log(`====================Username: ${user.username}====================`.cyan);
        console.log('[ Total gum ]'.cyan, balance_text.yellow);
        console.log('[ Vip Boost ]'.cyan, vip_boost.toString().yellow);
        console.log('[ Friend Boost ]'.cyan, friend_boost.toString().yellow);
        console.log('[ Premium Boost ]'.cyan, premium_boost.toString().yellow);
        console.log('[ Earned Amount ]'.cyan, earned_amount.toString().yellow);
        console.log('[ Mint Speed ]'.cyan, mint_speed.toString().yellow);

        if (earned_amount > 1000) {
            await claimMint(authorization);
        } else {
            console.log("Earned amount <= 1000. Only claim when amount > 1000".yellow);
        }

        if(isTodoTask){
            await getTask(authorization);
        }

    } catch (error) {
        console.error('Error sending request:'.red, error);
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const askTodoTask = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('Perform tasks? (y/n): '.blue, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
};

const run = async () => {
    const isTodoTask = await askTodoTask();
    while (true) {
        await new Promise((resolve, reject) => {
            async.eachOfLimit(queryData, queryData.length, async (query, index) => {
                await processQuery(query, isTodoTask);
            }, (err) => {
                if (err) {
                    console.error('Error processing queries:'.red, err);
                    reject(err);
                } else {
                    console.log('Finished processing queries'.green);
                    resolve();
                }
            });
        });
        console.log("==============All accounts have been processed=================".cyan);
        for (let i = timeCountDown * 60; i > 0; i--) {
            process.stdout.write(`\rStarting the next loop in ${i} seconds...`.yellow);
            await sleep(1000);
        }
    }
}

run();

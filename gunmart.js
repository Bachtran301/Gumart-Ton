const axios = require('axios');
const fs = require('fs');
const path = require('path');
const async = require('async');
const readline = require('readline');
const colors = require('colors'); // Thư viện màu sắc
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
        `.cyan); // Đoạn văn bản này sẽ hiển thị màu cyan
console.log('[+] Welcome & Enjoy Sir !'.green.bold); // Dòng chữ chào mừng màu xanh lá cây đậm
console.log('[+] Error? PM Telegram [https://t.me/NothingYub]'.red.bold); // Dòng chữ màu đỏ đậm thông báo về lỗi

const timeCountDown = 45

const processQuery = async (query_id, isTodoTask) => {
    query_id = query_id.replace(/[\r\n]+/g, '');
    const user_id_match = query_id.match(/user=%7B%22id%22%3A(\d+)/);
    if (!user_id_match) {
        console.error('Could not find user_id in query_id'.red); // Báo lỗi màu đỏ
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
            console.error('Error claiming ads'.red); // Báo lỗi màu đỏ
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
            console.log('Claim Successful!'.green.bold); // Hiển thị thành công màu xanh lá cây đậm
            console.log("[ Claim Value ]".cyan, resClaim.data.data.claim_value.toString().yellow); // Giá trị claim màu vàng
            console.log("[ Balance Value ]".cyan, resClaim.data.data.balance.toString().yellow); // Giá trị balance màu vàng
        } catch (error) {
            console.error('Cannot claim'.red); // Báo lỗi màu đỏ
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
                                    console.log("Started task: ".green, title.yellow); // Bắt đầu task với màu xanh và vàng
                                }catch{
                                    console.log("Cannot start task".red, itemTask.title.yellow); // Báo lỗi task màu đỏ và tên task màu vàng
                                }
                            } else if (itemTask.status === "claimable") {
                                try{
                                    const resClaimTask = await axios(claimTask(itemTask.id));
                                    const { title } = resClaimTask.data.data;
                                    console.log(`Task: ${title} has been completed!`.green.bold); // Hoàn thành task màu xanh lá cây đậm
                                }catch{
                                    console.log("Error claiming task: ".red, itemTask.title.yellow); // Báo lỗi claim task màu đỏ
                                }
                            }
                        }
                    }
                }
            }
            
            console.log("====> Starting tasks from Mission tab <====".blue); // Hiển thị khi bắt đầu task từ Mission tab màu xanh dương
            await todoTask(missions)
            console.log("====> Starting tasks from Task tab <====".blue); // Hiển thị khi bắt đầu task từ Task tab màu xanh dương
            await todoTask(tasks)
            
            console.log("=====> Task completed :D".green.bold); // Hiển thị khi task hoàn thành màu xanh đậm

        } catch (error) {
            console.error('Error performing tasks.'.red); // Báo lỗi màu đỏ
        }
    };

    try {
        const response = await axios(config);
        const data = response.data.data;
        const { access_token, type_token, user } = data;
        const authorization = type_token + " " + access_token;
        const homeData = await home(authorization);
        const { balance_text, friend_boost, earned_amount, mint_speed, vip_boost, premium_boost } = homeData.data.data

        console.log(`====================Username: ${user.username}====================`.cyan); // Tên username màu cyan
        console.log('[ Total gum ]'.cyan, balance_text.yellow); // Tổng gum màu cyan và balance màu vàng
        console.log('[ Vip Boost ]'.cyan, vip_boost.toString().yellow); // Vip Boost màu cyan và giá trị boost màu vàng
        console.log('[ Friend Boost ]'.cyan, friend_boost.toString().yellow); // Friend Boost màu cyan và giá trị boost màu vàng
        console.log('[ Premium Boost ]'.cyan, premium_boost.toString().yellow); // Premium Boost màu cyan và giá trị boost màu vàng
        console.log('[ Earned Amount ]'.cyan, earned_amount.toString().yellow); // Earned Amount màu cyan và giá trị số tiền kiếm được màu vàng
        console.log('[ Mint Speed ]'.cyan, mint_speed.toString().yellow); // Mint Speed màu cyan và giá trị tốc độ mint màu vàng

        if (earned_amount > 1000) {
            await claimMint(authorization)
        }else{
            console.log("Earned amount <= 1000. Only claim when amount > 1000".yellow); // Cảnh báo màu vàng khi số tiền kiếm được ít hơn hoặc bằng 1000
        }

        if(isTodoTask){
            await getTask(authorization)
        }

    } catch (error) {
        console.error('Error sending request:'.red, error); // Báo lỗi màu đỏ khi gửi yêu cầu thất bại
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
        rl.question('Perform tasks? (y/n): '.blue, (answer) => { // Hỏi người dùng với câu hỏi màu xanh dương
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
};

const run = async () => {
    const isTodoTask = await askTodoTask()
    while (true) {
        await new Promise((resolve, reject) => {
            async.eachOfLimit(queryData, queryData.length, async (query, index) => {
                await processQuery(query,isTodoTask);
            }, (err) => {
                if (err) {
                    console.error('Error processing queries:'.red, err); // Báo lỗi màu đỏ khi xử lý query thất bại
                    reject(err);
                } else {
                    console.log('Finished processing queries'.green.bold); // Hiển thị thành công khi xử lý query xong màu xanh lá cây đậm
                    resolve();
                }
            });
        });
        console.log("==============All accounts have been processed=================".cyan); // Thông báo hoàn thành xử lý tất cả tài khoản màu cyan
        for (let i = timeCountDown * 60; i > 0; i--) {
            process.stdout.write(`\rStarting the next loop in ${i} seconds...`.yellow); // Thông báo thời gian lặp lại màu vàng
            await sleep(1000);
        }
    }
}

run();

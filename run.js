const sql = require('mssql');
const http = require('http');
const https = require('https');
const urlModule = require('url');
const moment = require('moment');
const { execSel, execSP } = require('./tools/dbProc')
const log = require('./tools/logger')

const lastPeriodReports = '?code=rpt_scheduler&rpt_sch_id=568D8674-C3A7-46A7-BFF8-F0C7556A2BF0';
const nextPeriodReports = '?code=rpt_scheduler&rpt_sch_id=43437D83-4CE2-44DB-AD9B-FB9FB7D15A8F';

const init = async () => {
    // Get today's date in 'YYYY-MM-DD' format
    const today = moment().format('YYYY-MM-DD');

    try {
        // Execute SQL query to get co_id
        const coIDResult = await execSel('select top 1 co_row_guid from tb_co_profile');   
        const coID = coIDResult.data[0][0].co_row_guid;
             
        const reportURLResult = await execSel("select top 1 prop_value from tb_sys_prop where prop_name = 'pms_web_reporting_url'");
        const reportURL = reportURLResult.data[0][0].prop_value

        // Set up stored procedure parameters
        const storedProcedureName = 'pr_org_get_period';
        const parameters = {
            current_uid: 'NodeJsScheduler',
            co_id: coID,
            axn: 'get-org-period',
            dt1: today,
            direction: 0,
            url: '',
        };

        // Execute stored procedure
        const periodDateResult = await execSP(storedProcedureName, parameters);

        // Ensure date in correct format.
        const startDate = moment(periodDateResult.data[0][0].start_dt, 'YYYY-MM-DD');
        const endDate = moment(periodDateResult.data[0][0].end_dt, 'YYYY-MM-DD');
        const differenceInDays = endDate.diff(today, 'days');

        // Check if the date to send last period report
        if (moment(startDate).isSame(today)) {
            log('lastPeriodReports')
            executeURL(`${reportURL}${lastPeriodReports}`);
        }
        // Check if the date send next period report
        else if (differenceInDays <= 14) {
            log('nextPeriodReports')
            executeURL(`${reportURL}${nextPeriodReports}`);
        }

    } catch (err) {
        // Handle errors here
        log(err);
    }

    log('done.')
};

// Function to make an HTTP GET request
const executeURL = (url) => {
    return new Promise((resolve, reject) => {
        const parsedUrl = urlModule.parse(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(url, (res) => {
            let data = '';

            // A chunk of data has been received
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received
            res.on('end', () => {
                resolve(data);
                log(data);
            });
        }).on('error', (err) => {
            reject(`Error: ${err.message}`);
            log(`Error: ${err.message}`);
        });
    });
}

init();

import { XtraVision } from '../dist/xtravision';
import axios from 'axios';
import os from 'os';

// 
// let credentials = {
//   orgId: "2ac131d9-2e16-11ed-adfc-0242ac120002", 
//   appSecret: "bd684e63b23088ec",
//   appId: "2ac14a10-2e16-11ed-adfc-0242ac120002",
// }

const credentials: { orgId: string, appId: string, appSecret: string, userId?: any } = {
    orgId: "dd83059c-82f3-11ec-a9f5-a4bb6d6edc4e",
    appId: "95eacd45-82f5-11ec-a9f5-a4bb6d6edc4e",
    appSecret: "SK_WOLLENDANCE",
    userId: null,
}

/**
 * code Snippet for user registration
 */
async function registerUser() {
    /**
     * IMP:
     *  - You can use, "xtraObj" to register your all existing user or new users.
     *  - it will register user if email-id does not exit, else return existing details.
     *
     */
    // create auth token for user registration
    const xtraObj = new XtraVision(credentials);

    //user:
    const userObj = {
        email: process.env.XTRA_APP_USER ? process.env.XTRA_APP_USER as string : 'test@yourdomain.com',
        firstName: 'test',
        lastName: 'test',
        profileData: {
            height: 179,
            weight: 80,
        },
        // IANA Time Zone format, "Area/city", eg: America/New_York
        timezone: 'Asia/Kolkata'
    };
    try {
        return await xtraObj.registerUser(userObj);
    } catch (e) {
        errorHandler(e);
    }
}

/* @ts-ignore */
async function doSomeOperation(userId: string) {
    // get xtra-Object for specific user with 30days validation
    const xtraObj = new XtraVision({ ...credentials, userId }, { expiresIn: '30d' });

    // IMP: serve below authToken to your frontend SDK for further real-time operation
    const authToken = xtraObj.getAuthToken();
    log(`Authtoken for user-id(${userId}): `, authToken);

    try {
        const response = await axios.get('https://ipapi.co/json/');
        const { data } = response;

        const connectionDetails = {
            ipAddress: data?.ip,
            location: `${data?.city}, ${data?.region_code}, ${data?.country}`
        }

        const deviceDetails = {
            osDetails: {
                name: os.platform() || "Unknown OS",
                version: os.release() || "Unknown OS Version",
                apiVersion: process.versions.node || "Unknown OS apiVersion",
            },
            // needs to be checked:
            manufacturerDetails: {
                make: "Samsung",
                model: "Galaxy S10",
                variant: "SM-G973U"
            }
        };

        const sdkDetails = {
            name: process.env.npm_package_name || "Unknown SDK",
            version: process.env.npm_package_version || "Unknown SDK Version",
        };

        const metaData = {
            connectionDetails: connectionDetails,
            deviceDetails: deviceDetails,
            sdkDetails: sdkDetails
        };

        // get session-id
        let sessionData = await xtraObj.getSessionId(metaData)
        log("sessionData ", sessionData)
    } catch (err) {
        console.log("An error occured :", err)
    }

    // log(" Validate Request Data", await xtraObj.getAuthorizedData('mt', null, {assessmentName:"SQUATS", requestedAt:Date.now(), c:1}))

    // get results of current month
    const currentDate = new Date(); //Date("11/30/2012")
    const currentMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // adjust this for filtering the results
    const limit = 5;
    const offset = 0;
    // flag to get more detailed stats
    const isRequiredStats = true;

    const assessmentResults = await xtraObj.getUserAssessmentResults(limit, offset, {
        startDate: currentMonthFirstDay,
        endDate: currentDate,
        isRequiredStats,
    },
    );

    // show all assessmentResults: display empty array if data is not present
    log('User assessmentResults:', assessmentResults);

    // fist user assessmentResults
    assessmentResults.length > 0 ? log('First result of assessmentResults:', assessmentResults[0].results) : '';

}

// utility method
const log = function (param1: any, param2?: any) {
    param2 ? console.log(Date() + ' ' + param1, param2) : console.log(Date() + ' ' + param1);
};

// error handler
function errorHandler(e: any) {
    console.error('ErrorHandler: ', e?.message);
    console.error('Error Object', e);

    process.exit(1);
}

async function start() {
    try {
        //Register user, if user does not exit. (Get same details if email id already exist)
        const userDetails = await registerUser();

        //IMP: store user-id into required db so you can get data
        log('Fetch userDetails', userDetails);

        // let's do some operations
        await doSomeOperation(userDetails.id);

    } catch (e) {
        errorHandler(e)
    }

    process.exit(0);
}

start();

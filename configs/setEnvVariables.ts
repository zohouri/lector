import path from 'path';
import { config } from 'dotenv';

const setEnvVariables = () => {
    let configFilePath = '';
    if (process.env.NODE_ENV === 'production') {
        if (process.env.PRIVILEGE === 'admin') {
            configFilePath = path.resolve(__dirname, 'config.admin.prd.env');
        } else {
            configFilePath = path.resolve(__dirname, 'config.user.prd.env');
        }
    } else {
        if (process.env.PRIVILEGE === 'admin') {
            configFilePath = path.resolve(__dirname, 'config.admin.dev.env');
        } else {
            configFilePath = path.resolve(__dirname, 'config.user.dev.env');
        }
    }
    config({ path: configFilePath });
};

export default setEnvVariables;

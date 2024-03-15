const fs = require('fs');
const crypto = require('crypto');
const sql = require('mssql');
const path = require('path');
const s = fs.readFileSync(path.join(__dirname, '../config/db'), 'utf8');
const pkey = path.join(__dirname, '../config/config.pem');

const dencryptText = (s, k) => {
  const buf = Buffer.from(s, 'base64');

  const privateKey = fs.readFileSync(k);
  const dencrypted = crypto.publicDecrypt(privateKey, buf);
  return dencrypted.toString();
};

const dbConfig = JSON.parse(dencryptText(s, pkey));

const config = sqlConfig = {
  user: dbConfig.db_uid,
  password: dbConfig.db_pwd,
  database: dbConfig.db_db,
  server: dbConfig.db_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 10000,
  },
  options: {
    encrypt: false,
    // change to true for local dev / self-signed certs
    trustServerCertificate: false,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
    },
  },
};

const executeStoredProcedure = async (storedProcedure, parameters) => {
  let pool;

  try {
    pool = await sql.connect(config);
    const request = pool.request();

    if (parameters) {
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] && parameters[key].output) {
          request.output(key, parameters[key].type, parameters[key].value);
        } else {
          request.input(key, parameters[key]);
        }
      });
    }

    const result = await request.execute(storedProcedure);
    const outputParameters = {};

    Object.keys(parameters).forEach((key) => {
      if (parameters[key] && parameters[key].output) {
        outputParameters[key] = result.output[key];
      }
    });

    return { data: result.recordsets, msg: outputParameters.result };

  } catch (err) {
    throw err;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const executeSelectStatement = async (selectQuery) => {
  let pool;

  try {
    pool = await sql.connect(config);
    const request = pool.request();

    const result = await request.query(selectQuery);

    if (result.recordset.length === 0) {
      return []; // Return an empty array if no results are found
    }

    return { data: result.recordsets };

  } catch (err) {
    throw err;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = {
  execSP: executeStoredProcedure,
  execSel: executeSelectStatement,
};

import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number,
    caregivers: {
        name: string,
        patients: string
    }[]
}

export const getReport = async (req: Request, res: Response) => {

    const sql = `
        SELECT
        caregiver.id      AS caregiver_id,
        caregiver.name    AS caregiver_name,
        array_to_string(ARRAY_AGG(patient.name),', ') As patients
        FROM caregiver
        JOIN visit ON visit.caregiver = caregiver.id
        JOIN patient ON patient.id = visit.patient
        where extract(year from visit.date) = ${req.params.year}
        GROUP BY caregiver.id;
    `;
   
    let result : QueryResult;
    try {
        result = await dbUtil.sqlToDB(sql, []);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: []
        };
        for ( let row of result.rows) {
            report.caregivers.push({
                name: row.caregiver_name,
                patients: row.patients
            })
        }
        res.status(200).json(report);
    } catch (error) {
        throw new Error(error.message);
    }

}

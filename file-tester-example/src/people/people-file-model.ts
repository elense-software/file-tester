import {FileSpecs} from "../../../file-creator/concrete-creators/test-file";
import {ApiProperty} from "@nestjs/swagger";

export type PeopleFileHeader = ["First name", "Middle name", "Last name", "Age", "Type"]
export type PeopleFileData = [string, string | null, string, number, string]

export type PeopleFileType = [
    PeopleFileHeader,
    ...PeopleFileData[]
]

export class PeopleFileRow {
    @ApiProperty()
    readonly firstName: string

    @ApiProperty()
    readonly middleName: string | null

    @ApiProperty()
    readonly lastName: string

    @ApiProperty()
    readonly age: number

    @ApiProperty()
    readonly type: string

    constructor(firstName: string, middleName: string | null, lastName: string, age: number, type: string) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.age = age;
        this.type = type;
    }
}

export class PeopleFile implements FileSpecs {
    readonly header: PeopleFileHeader = ['First name', 'Middle name', 'Last name', 'Age', "Type"]
    readonly rows: PeopleFileRow[] = []

    constructor(data: any[][]) {
        if(data.length === 0) {
            return
        }
        if (this.header.length !== data[0].length) {
            throw new Error(`Invalid header. Expected: ${this.header}, got: ${data[0]}`)
        }

        this.rows.push(...data.map(row => new PeopleFileRow(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4]
        )))
    }
}

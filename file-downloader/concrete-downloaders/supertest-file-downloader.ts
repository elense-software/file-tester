import request from 'supertest'
import {FileDownloader} from "../file-downloader";
import {TestFile} from "../../file-creator/concrete-creators/test-file";
import {SpreadsheetTestFile} from "../../file-creator/concrete-creators/spreadsheet-test-file";

export interface SupertestFileDownloaderConfiguration {
    /**
     * If not specified at SupertestFileUploader creation it must be specified at calling upload method in downloadParameters
     */
    factory?: (buffer: Buffer) => TestFile

    /**
     * If not specified at SupertestFileUploader creation it must be specified at calling upload method in downloadParameters
     */
    appOrBaseUrl?: any

    /**
     * The endpoint URL from which the file will be downloaded.
     * If not specified at SupertestFileDownloader creation, it must be specified when calling the download method in downloadParameters.
     */
    endpointUrl?: string

    /**
     * A function to customize the request before it is sent.
     * @param request - The Supertest request object.
     * @param downloadParameters - Additional parameters for the download.
     * @returns The customized request object.
     */
    customizeRequest?: (request: request.Test, downloadParameters?: any) => request.Test
}

export class SupertestFileDownloader implements FileDownloader {
    constructor(readonly configuration: SupertestFileDownloaderConfiguration) {}

    async download(downloadParameters?: Partial<SupertestFileDownloaderConfiguration> | any): Promise<TestFile> {
        const mergedConfig = { ...this.configuration, ...downloadParameters }

        const initRequest: request.Test = request(mergedConfig.appOrBaseUrl).get(mergedConfig.endpointUrl)

        const preparedRequest: request.Test = mergedConfig.customizeRequest
            ? mergedConfig.customizeRequest(initRequest, downloadParameters)
            : initRequest

        const response: request.Response = await preparedRequest

        const responseBody: Buffer = await response.body

        return mergedConfig.factory(responseBody)
    }
}

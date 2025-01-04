import request from 'supertest'
import {FileDownloader} from "../file-downloader";

export interface SupertestFileDownloaderConfiguration {
    /**
     * If not specified at SupertestFileUploader creation it must be specified at calling upload method in uploadParameters
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

    async download(downloadParameters?: Partial<SupertestFileDownloaderConfiguration> | any): Promise<Buffer> {
        const mergedConfig = { ...this.configuration, ...downloadParameters }

        const initRequest: request.Test = request(mergedConfig.appOrBaseUrl).get(mergedConfig.endpointUrl)

        const preparedRequest: request.Test = mergedConfig.customizeRequest
            ? mergedConfig.customizeRequest(initRequest, downloadParameters)
            : initRequest

        const response: request.Response = await preparedRequest

        const responseBody: Buffer = await response.body

        return responseBody
    }
}

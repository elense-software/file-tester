import request from 'supertest'
import {FileUploader, FileUploadResult} from "../file-uploader";

export interface SupertestFileUploaderConfiguration {
    /**
     * If not specified at SupertestFileUploader creation it must be specified at calling upload method in uploadParameters
     * For NestJS tests it's: moduleFixture.createNestApplication().getHttpServer()
     * Alternatively it's server address like 'http://localhost:3000'
     */
    appOrBaseUrl?: any

    /**
     * If not specified at SupertestFileUploader creation it must be specified at calling upload method in uploadParameters
     */
    endpointUrl?: string

    /**
     * The field name for the file attachment in the multipart/form-data request.
     * @default: 'data'
     */
    fileAttachmentFieldName?: string

    /**
     * A function to customize the request before it is sent.
     * @param request - The Supertest request object.
     * @param uploadParameters - Additional parameters for the upload.
     * @returns The customized request object.
     */
    customizeRequest?: (request: request.Test, uploadParameters?: any) => request.Test
}

export class SupertestFileUploader implements FileUploader {
    constructor(readonly configuration: SupertestFileUploaderConfiguration) {}

    async upload(
        absoluteFilePath: string,
        uploadParameters?: Partial<SupertestFileUploaderConfiguration> | any
    ): Promise<FileUploadResult> {
        const mergedConfig = { ...this.configuration, ...uploadParameters }

        const initRequest: request.Test = request(mergedConfig.appOrBaseUrl)
            .post(mergedConfig.endpointUrl)
            .set('Content-Type', 'multipart/form-data')
            .attach(mergedConfig.fileAttachmentFieldName ?? 'data', absoluteFilePath)

        const preparedRequest: request.Test = mergedConfig.customizeRequest
            ? mergedConfig.customizeRequest(initRequest, uploadParameters)
            : initRequest

        const response: request.Response = await preparedRequest

        const isSuccessful: boolean = response.statusCode.toString().startsWith('2')
        const responseBody: any = await response.body

        return {
            isSuccessful,
            response,
            responseBody,
        }
    }
}

export interface FileUploadResult {
    isSuccessful: boolean
    response: any
    responseBody?: any
}

export interface FileUploader {
    upload(absoluteFilePath: string, uploadParameters?: any): Promise<FileUploadResult>
}

export interface FileDownloader {
    download(downloadParameters?: any): Promise<Buffer>
}

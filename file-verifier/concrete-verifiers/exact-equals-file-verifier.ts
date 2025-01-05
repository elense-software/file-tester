import {FileVerifier} from "../file-verifier";

import {TestFile} from "../../file-creator/concrete-creators/test-file";

export class DefaultFileVerifier implements FileVerifier {
    async verify(actualFile: TestFile): Promise<void> {
        // verify file is not empty
    }
}

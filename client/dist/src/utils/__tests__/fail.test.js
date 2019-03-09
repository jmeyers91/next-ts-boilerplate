import fail from '../fail';
describe('utils/fail', () => {
    test('Should throw an error', () => {
        let error;
        try {
            fail('test error');
        }
        catch (e) {
            error = e;
        }
        expect(error).toBeTruthy();
        expect(error.message).toEqual('test error');
    });
});
//# sourceMappingURL=fail.test.js.map
class LedDisplayService {
    async displayNumber(number) {
        console.log(`LED Display: ${number}`);
    }
    
    async clearAndResetDisplay() {
        console.log(`LED Display Cleared`);
    }
}

const ledDisplayService = new LedDisplayService();
export default ledDisplayService;

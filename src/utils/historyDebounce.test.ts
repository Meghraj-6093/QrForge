import { normalizeUrlInput } from './urlNormalizer';

/**
 * QRForge History Debounce Unit Tests
 * Simulates the exact state, timer, and versioning logic used in App.tsx.
 */

interface HistoryItem {
  id: string;
  timestamp: number;
  type: string;
  title: string;
  data: string;
}

class HistoryDebounceSimulator {
  public history: HistoryItem[] = [];
  public historyTimer: ReturnType<typeof setTimeout> | null = null;
  public inputVersion = 0;
  public isRestoringFromHistory = false;
  public activeView = 'create';
  public currentRawText = '';
  public contentType = 'url';

  public saveToHistory(dataStr: string, itemType: string) {
    if (!dataStr || dataStr.trim().length === 0) return;
    if (this.isRestoringFromHistory) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: itemType,
      title: dataStr.length > 35 ? dataStr.substring(0, 35) + '...' : dataStr,
      data: dataStr,
    };

    const filtered = this.history.filter((item) => item.data !== dataStr);
    this.history = [newItem, ...filtered].slice(0, 25);
  }

  public getEncodedData() {
    if (this.contentType === 'url') {
      const res = normalizeUrlInput(this.currentRawText);
      return { data: res.isValid ? res.normalizedUrl : '', isValid: res.isValid };
    }
    const trimmed = this.currentRawText.trim();
    return { data: trimmed, isValid: trimmed.length > 0 };
  }

  public onInputChange(newText: string) {
    this.currentRawText = newText;

    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }

    if (this.isRestoringFromHistory || this.activeView !== 'create') {
      return;
    }

    const currentVersion = ++this.inputVersion;

    this.historyTimer = setTimeout(() => {
      this.historyTimer = null;

      if (this.inputVersion !== currentVersion || this.isRestoringFromHistory) {
        return;
      }

      const { data, isValid } = this.getEncodedData();
      if (isValid && data && data.trim().length > 0) {
        this.saveToHistory(data, this.contentType);
      }
    }, 3000);
  }

  public loadFromHistory(item: HistoryItem) {
    this.isRestoringFromHistory = true;
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }
    this.contentType = item.type;
    this.currentRawText = item.data;
    setTimeout(() => {
      this.isRestoringFromHistory = false;
    }, 300);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- Running QRForge History Debounce Tests ---');

  // Scenario A: Rapid typing -> stop -> exactly ONE entry after 3s
  {
    const sim = new HistoryDebounceSimulator();
    sim.onInputChange('h');
    await sleep(200);
    sim.onInputChange('hy');
    await sleep(200);
    sim.onInputChange('hyp');
    await sleep(200);
    sim.onInputChange('hyperionweb.vercel.app');
    
    // Check immediately: typing should not save to history
    if (sim.history.length !== 0) {
      throw new Error(`Scenario A Failed: Expected 0 entries while typing, got ${sim.history.length}`);
    }

    // Wait 3.2 seconds
    await sleep(3200);

    if ((sim.history as HistoryItem[]).length !== 1) {
      throw new Error(`Scenario A Failed: Expected 1 history entry, got ${sim.history.length}`);
    }
    if (sim.history[0].data !== 'https://hyperionweb.vercel.app/') {
      throw new Error(`Scenario A Failed: Unexpected payload ${sim.history[0].data}`);
    }
    console.log('[PASS] Scenario A: Rapid typing created exactly 1 history entry after 3s inactivity.');
  }

  // Scenario B: Invalid URL -> stop -> ZERO entries
  {
    const sim = new HistoryDebounceSimulator();
    sim.onInputChange('hello world'); // invalid URL
    await sleep(3200);

    if (sim.history.length !== 0) {
      throw new Error(`Scenario B Failed: Expected 0 history entries for invalid URL, got ${sim.history.length}`);
    }
    console.log('[PASS] Scenario B: Invalid input created 0 history entries after 3s.');
  }

  // Scenario C: Valid URL, modify before 3s -> only final saved
  {
    const sim = new HistoryDebounceSimulator();
    sim.onInputChange('github.com');
    await sleep(1500); // 1.5s passed, not yet 3s
    sim.onInputChange('google.com'); // edit input before 3s
    await sleep(2000); // 2s after edit, total 3.5s from start, but only 2s from last edit

    if (sim.history.length !== 0) {
      throw new Error(`Scenario C Failed: Timer did not reset on modification! Got ${sim.history.length} entries`);
    }

    await sleep(1500); // wait remaining 1.5s

    if ((sim.history as HistoryItem[]).length !== 1 || sim.history[0].data !== 'https://google.com/') {
      throw new Error(`Scenario C Failed: Expected only final URL https://google.com/ saved, got ${JSON.stringify(sim.history)}`);
    }
    console.log('[PASS] Scenario C: Modifying input before 3s reset timer and saved only final URL.');
  }

  // Scenario D: Valid URL -> wait 3s -> edit again -> wait 3s -> both saved / updated independently
  {
    const sim = new HistoryDebounceSimulator();
    sim.onInputChange('github.com');
    await sleep(3200);
    if (sim.history.length !== 1 || sim.history[0].data !== 'https://github.com/') {
      throw new Error(`Scenario D Part 1 Failed: First URL not saved properly`);
    }

    sim.onInputChange('vercel.com');
    await sleep(3200);
    if ((sim.history as HistoryItem[]).length !== 2 || (sim.history[0].data as string) !== 'https://vercel.com/') {
      throw new Error(`Scenario D Part 2 Failed: Second URL not saved properly`);
    }
    console.log('[PASS] Scenario D: Sequential edits after 3s each evaluated independently.');
  }

  // Scenario E: Load history item -> no duplicate entry created
  {
    const sim = new HistoryDebounceSimulator();
    const mockItem: HistoryItem = {
      id: '101',
      timestamp: Date.now(),
      type: 'url',
      title: 'https://github.com/',
      data: 'https://github.com/',
    };
    sim.history = [mockItem];

    sim.loadFromHistory(mockItem);
    await sleep(3500);

    if (sim.history.length !== 1) {
      throw new Error(`Scenario E Failed: Loading history created duplicate entry! Got ${sim.history.length}`);
    }
    console.log('[PASS] Scenario E: Loading history item created no duplicate entries.');
  }

  console.log('\n--- All History Debounce Unit Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error(err);
});

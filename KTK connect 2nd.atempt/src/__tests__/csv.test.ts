import { jest } from '@jest/globals';
import { exportToCSV } from '../utils/csv';

const setupObjectUrl = () => {
  const createObjectURL = jest.fn(() => 'blob:mock');
  Object.defineProperty(URL, 'createObjectURL', {
    value: createObjectURL,
    writable: true,
  });
  return createObjectURL;
};

test('exports CSV data as a downloadable file', () => {
  const createObjectURL = setupObjectUrl();
  const appendSpy = jest.spyOn(document.body, 'appendChild');
  const removeSpy = jest.spyOn(document.body, 'removeChild');
  const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  exportToCSV(['name', 'score'], [{ name: 'Alex', score: 42 }], 'scores.csv');

  expect(createObjectURL).toHaveBeenCalled();
  expect(appendSpy).toHaveBeenCalled();
  expect(removeSpy).toHaveBeenCalled();
  expect(clickSpy).toHaveBeenCalled();

  const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
  expect(link.getAttribute('download')).toBe('scores.csv');
  expect(link.getAttribute('href')).toBe('blob:mock');

  appendSpy.mockRestore();
  removeSpy.mockRestore();
  clickSpy.mockRestore();
});

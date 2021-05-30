/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {act, renderHook} from '@testing-library/react-hooks';
import useRemoteData, {FetchService} from '../use-remote-data';
import {TestRequestData, TestResponseData, TestUseRemoteDataController} from '../__mocks__/mock-interfaces';

describe('given simple service', () => {
  let service!: FetchService<TestRequestData, TestResponseData> | undefined;
  let waitForNextUpdate: () => Promise<unknown>;
  let result: {current: TestUseRemoteDataController};
  let rerender: (props?: unknown) => void;

  beforeAll(() => {
    service = {
      send(input: TestRequestData): Promise<TestResponseData> {
        if (input.name === 'John') {
          return Promise.resolve([{name: 'John', details: 'Nothing'}]);
        } else {
          return Promise.reject(new Error('Error 404'));
        }
      }
    };
  });
  afterAll(() => {
    service = undefined;
  });
  it('should return only requestData function defined while initial render', () => {
    expect(service).toBeDefined();
    ({result, rerender, waitForNextUpdate} = renderHook(() =>
      useRemoteData<TestRequestData, TestResponseData>(service!)
    ));
    const {data, error, send, loading} = result.current;
    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
    expect(send).toBeInstanceOf(Function);
    expect(loading).toBeUndefined();
  });
  it('should return loading = true when data requested', async () => {
    rerender();
    const {send} = result.current;
    act(() => {
      send({name: 'John'});
    });
    {
      const {data, error, loading} = result.current;
      expect(data).toBeUndefined();
      expect(error).toBeUndefined();
      expect(loading).toBeTruthy();
    }
    {
      await waitForNextUpdate();
      const {data, error, loading} = result.current;
      expect(data).toEqual([{details: 'Nothing', name: 'John'}]);
      expect(error).toBeUndefined();
      expect(loading).toBeFalsy();
    }
  });
  it('should return error 404 when data data not found', async () => {
    rerender();
    const {send} = result.current;
    act(() => {
      send({name: 'Kate'});
    });
    {
      const {data, error, loading} = result.current;
      expect(data).toBeUndefined();
      expect(error).toBeUndefined();
      expect(loading).toBeTruthy();
    }
    {
      await waitForNextUpdate();
      const {data, error, loading} = result.current;
      expect(data).toEqual(undefined);
      expect(error).toEqual(new Error('Error 404'));
      expect(loading).toBeFalsy();
    }
  });
});
describe('given service undefined', () => {
  it('should throw an exception', () => {
    const service = undefined;
    const {result} = renderHook(() => useRemoteData<TestRequestData, TestResponseData>(service!));
    expect(result.error).toEqual(new Error('no service provided'));
  });
});

describe('given service allowing to cancel the request', function () {
  it('should cancel request', async function () {
    const {result} = renderHook(() =>
      useRemoteData<TestRequestData, TestResponseData>({
        send(): Promise<TestResponseData> {
          return Promise.resolve([]);
        }
      })
    );
    let e;
    act(() => {
      const cancel = result.current.send({name: 'John'});
      e = new Error('no canceler provided');
      expect(cancel).toThrow();
    });
    const {data, error, loading} = result.current;
    expect(data).toEqual(undefined);
    expect(error).toEqual(e);
    expect(loading).toBeFalsy();
  });
});

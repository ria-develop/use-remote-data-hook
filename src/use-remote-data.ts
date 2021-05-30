import {useCallback, useState} from 'react';

export interface Canceler {
  (message?: string): void;
}

export interface FetchService<T, R> {
  send(inputData: T): Promise<R>;
  cancel?: Canceler;
}

export interface UseRemoteDataController<RequestDataShape, ResponseDataShape> {
  data?: ResponseDataShape;
  loading?: boolean;
  error?: Error;
  send: (request: RequestDataShape) => Canceler;
}

export default function useRemoteData<RequestDataShape, ResponseDataShape>(
  service: FetchService<RequestDataShape, ResponseDataShape>
): UseRemoteDataController<RequestDataShape, ResponseDataShape> | never {
  if (!service) throw new Error('no service provided');
  const [data, setData] = useState<ResponseDataShape>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<Error>();

  const onRequest = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setData(undefined);
  }, []);

  const onComplete = useCallback((data) => {
    setData(data);
    setLoading(false);
  }, []);

  const onError = useCallback((e) => {
    if (e.message !== 'no canceler provided') {
      setError(e);
      setLoading(false);
    }
  }, []);

  const send = useCallback((requestData: RequestDataShape): Canceler => {
    onRequest();
    let fail: Error;
    service
      .send(requestData)
      .then((data) => {
        if (fail) {
          throw fail;
        }
        return data;
      })
      .then(onComplete)
      .catch(onError);
    return (
      service.cancel ||
      (() => {
        fail = new Error('no canceler provided');
        setLoading(false);
        setError(fail);
        throw fail;
      })
    );
  }, []);

  return {
    data,
    loading,
    error,
    send
  };
}

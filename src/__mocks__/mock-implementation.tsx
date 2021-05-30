import useRemoteData, {FetchService} from '../use-remote-data';
import React, {useEffect} from 'react';

export function TestComponent<T, P>({inputData, service}: {inputData?: T; service: FetchService<T, P>}): JSX.Element {
  const {loading, error, data, send} = useRemoteData<T, P>(service);
  useEffect(() => {
    if (inputData) {
      send(inputData);
    }
  }, [send, inputData]);

  return (
    <div className="application">
      {loading && <div>loading...</div>}
      {error && <div>{error.message}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}

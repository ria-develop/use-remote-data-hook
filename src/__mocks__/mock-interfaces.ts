import {UseRemoteDataController} from '../use-remote-data';

export type TestRequestData = {
  name: string;
};
export type TestEntry = {
  name: string;
  details: string;
};
export type TestResponseData = TestEntry[];
export type TestUseRemoteDataController = UseRemoteDataController<TestRequestData, TestResponseData>;

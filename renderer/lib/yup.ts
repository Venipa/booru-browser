import * as yup from "yup";
import { testHasChange } from "./helper";

yup.addMethod(yup.object, "distinctUntilChanged", function (message) {
  return this.test("DistinctUntilChanged", message, testHasChange());
});

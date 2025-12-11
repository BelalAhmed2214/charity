<?php

namespace App\Traits;

use Illuminate\Http\Response;

trait ResponseTrait
{
    private function returnSuccess($msg = "", $status = Response::HTTP_OK)
    {
        return response()->json([
            'result' => true,
            'status' => $status,
            'message' => $msg,
            'data' => [],
        ], $status);
    }
    public function returnError($msg, $status = Response::HTTP_NOT_FOUND)
    {
        return response()->json([
            'result' => false,
            'status' => $status,
            'message' => $msg,
            'data' => (object) [],
        ], $status);
    }
    public function returnData($key, $value, $msg = "", $status = Response::HTTP_OK)
    {
        return response()->json([
            'result' => "true",
            'message' => $msg,
            'status' => $status,
            $key => $value,

        ], $status);
    }
}

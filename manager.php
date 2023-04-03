<?php
error_reporting(E_ERROR | E_PARSE);

$directory = isset($_POST['dir']) ? "explorer/" . $_POST['dir'] : "explorer/";

if (isset($_FILES['file'])) {
    $fileDir = $directory . $_FILES['file']['name'];
    if (file_exists($fileDir))
        unlink($fileDir);

    if (is_dir($directory) && is_writable($directory)) {
        if (move_uploaded_file($_FILES['file']['tmp_name'], $fileDir)) {
            $response = array('status' => true, 'msg' => 'File uploaded');
        } else {
            $response = array('status' => false, 'msg' => 'File upload error!');
        }
    } else {
        $response = array('status' => false, 'msg' => 'Upload directory is not writable, or does not exist.');
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
}elseif (isset($_POST['createFolder'])){
    $dir = $directory . $_POST['createFolder'];
    if (is_dir($dir)){
        $response = array('status' => false, 'msg' => 'This directory already exist!');
    }else{
        if (mkdir($dir)){
            $response = array('status' => true, 'msg' => 'Directory created!');
        }else{
            $response = array('status' => false, 'msg' => 'Permission denied');
        }
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
}elseif (isset($_POST['delete'])){
    $dir = $directory . $_POST['delete'];
        rrmdir($dir);
    $response = array('status' => true, 'msg' => (is_dir($dir) ? 'Directory' : 'File') . ' deleted!');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
} else {
    $dir = array_diff(scandir($directory), array('..', '.'));
    $response = array();
    foreach ($dir as $item) {
        $fileDir = $directory . $item;
        $res = array(
            'class' => 'folder',
            'name' => $item,
            'edit' => date("Y-m-d H:i:s", filemtime($fileDir))
        );
        if (!is_dir($fileDir))
            $res['class'] = 'file';
        $response[] = $res;
    }
    usort($response, function ($a, $b) {
        if ($a['class'] > $b['class']) {
            return -1;
        } elseif ($a['class'] < $b['class']) {
            return 1;
        }
        return 0;
    });
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response);
}


function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
                    rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                else
                    unlink($dir. DIRECTORY_SEPARATOR .$object);
            }
        }
        rmdir($dir);
    }else{
        unlink($dir);
    }
}
<?php
class des {
    
    private $strKey = 'asJHjhiH';
    
    public function encode($strInput) {
        $strInput = $this->pkcs5_pad($strInput);
        $td = mcrypt_module_open('des', '', 'ecb', '');
        $iv = mcrypt_create_iv (mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
        mcrypt_generic_init($td, $this->strKey, $iv);
        $data = mcrypt_generic($td, $strInput);
        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);
        $data = base64_encode($data);
        return $data;
    }
    
    public function decode($strInput) {
        $strInput = base64_decode($strInput);
        $td = mcrypt_module_open('des', '', 'ecb', '');
        $iv = mcrypt_create_iv (mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
        mcrypt_generic_init($td, $this->strKey, $iv);
        $data = mdecrypt_generic($td, $strInput);
        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);
        return $this->pkcs5_unpad($data);
    }
    
    function pkcs5_pad($text) {   
        $pad = 8 - (strlen($text) % 8);
        return $text . str_repeat(chr($pad), $pad);
    }
    
    function pkcs5_unpad($text) {
        $pad = ord($text{strlen($text)-1});
        if ($pad > strlen($text)) {
            return false;
        }
        if (strspn($text, chr($pad), strlen($text) - $pad) != $pad) {
            return false;
        }
        return substr($text, 0, -1 * $pad);
    }
}

class zis {
    private $listPan = array();
    private $listA = array();
    private $listB = array();
    private $arrKilled = array();
    private $arrPan = array(
        'e0' => array('e1', 'e2', 'e3'),
        'e1' => array('e0', 'e2', 's3'),
        'e2' => array('e1', 'e0', 'e3', 'c1'),
        'e3' => array('e0', 'e2', 'n1'),
        's0' => array('s1', 's2', 's3'),
        's1' => array('s0', 's2', 'w3'),
        's2' => array('s1', 's0', 's3', 'c2'),
        's3' => array('s0', 's2', 'e1'),
        'w0' => array('w1', 'w2', 'w3'),
        'w1' => array('w0', 'w2', 'n3'),
        'w2' => array('w1', 'w0', 'w3', 'c3'),
        'w3' => array('w0', 'w2', 's1'),
        'n0' => array('n1', 'n2', 'n3'),
        'n1' => array('n0', 'n2', 'e3'),
        'n2' => array('n1', 'n0', 'n3', 'c4'),
        'n3' => array('n0', 'n2', 'w1'),
        'c0' => array('c1', 'c2', 'c3', 'c4'),
        'c1' => array('e2', 'c2', 'c0', 'c4'),
        'c2' => array('c1', 'c0', 'c3', 's2'),
        'c3' => array('w2', 'c2', 'c0', 'c4'),
        'c4' => array('c1', 'c0', 'c3', 'n2')
    );
    
    public function load($arr) {
        $this->listA = array();
        $this->listB = array();
        $this->listPan = array();
        if (count($arr) > 12) {
            return false;
        }
        $arrPos = array_keys($this->arrPan);
        $arrZi = array('a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5');
        $arrPushed = array();
        foreach ($arr as $pos => $sn) {
            if (!in_array($pos, $arrPos) || !in_array($sn, $arrZi) || in_array($sn, $arrPushed)) {
                return false;
            }
            array_push($arrPushed, $sn);
            $team = strtoupper(substr($sn, 0, 1));
            $sn = $team . substr($sn, 1);
            $zi = new zi($team, $sn, $pos);
            $this->listPan[$pos] = $zi;
            if ('A' == $zi->team) {
                $this->listA[$sn] = $zi;
            } elseif ('B' == $zi->team) {
                $this->listB[$sn] = $zi;
            }
        }
        return $this->analyze();
    }
    
    public function genSimpleData($t) {
        $strRe = date('YmdHis') . $t;
        foreach ($this->listPan as $pos => $zi) {
            $strRe .= $pos . strtolower($zi->sn);
        }
        $des = new des();
        $strRe = @$des->encode($strRe);
        return $strRe;
    }
    
    public function __construct($blnInit = true) {
        if ($blnInit) {
            $arrTemp = array('s0', 's1', 's2', 's3', 'w3', 'e1');
            foreach ($arrTemp as $k => $p) {
                $k = 'A' . $k;
                $objZi = new zi('A', $k, $p);
                $this->listA[$k] = $objZi;
                $this->listPan[$p] = $objZi;
            }
            $arrTemp = array('n0', 'n1', 'n2', 'n3', 'w1', 'e3');
            foreach ($arrTemp as $k => $p) {
                $k = 'B' . $k;
                $objZi = new zi('B', $k, $p);
                $this->listB[$k] = $objZi;
                $this->listPan[$p] = $objZi;
            }
        }
    }
    
    public function analyze() {
        $arrCanNotMoved = array();
        foreach ($this->listPan as $pos => $zi) {
            (!$this->canBeMoved($zi)) && array_push($arrCanNotMoved, $zi);
        }
        if (count($arrCanNotMoved) > 0) {
            $arrArround = array();
            foreach ($arrCanNotMoved as $zi) {
                $arrAI = $this->getAroundInfo($zi);
                if (count($arrAI['friend']) == 0) { // 单个消除
                    $this->kill($zi);
                    return $this->analyze();
                } else {
                    $arrArround[$zi->pos] = array('zi' => $zi, 'info' => $arrAI);
                }
            }
            if (count($arrArround) > 0) {
                foreach ($arrArround as $pos => $arrTemp) { // 两个相互依存消除
                    if (isset($this->listPan[$pos])) {
                        if (count($arrTemp['info']['friend']) == 1) {
                            $pos_ = $arrTemp['info']['friend'][0]->pos;
                            if (isset($arrArround[$pos_])) {
                                if (count($arrArround[$pos_]['info']['friend']) == 1) {
                                    if ($arrArround[$pos_]['info']['friend'][0]->pos == $pos) {
                                        $this->kill($arrTemp['zi']);
                                        $this->kill($arrTemp['info']['friend'][0]);
                                        return $this->analyze();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (count($arrArround) > 0) {
                $arrLink = $this->getLink($arrArround); // 两个以上相互依存
                if (count($arrLink) > 0) {
                    foreach ($arrLink as $arrPos) {
                        if ($this->getLinkAround($arrPos)) {
                            return $this->analyze();
                        }
                    }
                }
            }
        }
    }
    
    public function getLinkAround($arr) {
        $arrBig = array();
        foreach ($arr as $pos) {
            $arrBig = array_merge($arrBig, $this->arrPan[$pos]);
        }
        $arrBig = array_unique($arrBig);
        $arrBig = array_diff($arrBig, $arr);
        $blnKill = false;
        if (count($arrBig) > 0) {
            $blnKill = true;
            $team = $this->listPan[$arr[0]]->team;
            foreach ($arrBig as $pos) {
                if ($this->listPan[$pos]->team == $team) {
                    $blnKill = false;
                    break;
                }
            }
        }
        if ($blnKill) {
            foreach ($arr as $pos) {
                $this->kill($this->listPan[$pos]);
            }
        }
        return $blnKill;
    }
    
    public function getLink($arr) {
        $arrRe = array();
        foreach ($arr as $pos => $arrTemp) {
            if (count($arrTemp['info']['friend']) > 0) {
                foreach ($arrTemp['info']['friend'] as $obj) {
                    if (isset($arr[$obj->pos])) {
                        $blnFind = false;
                        foreach ($arrRe as $key => $arrItem) {
                            if (in_array($pos, $arrItem)) {
                                (!in_array($obj->pos, $arrRe[$key])) && array_push($arrRe[$key], $obj->pos);
                                $blnFind = true;
                            }
                        }
                        if (!$blnFind) {
                            (!isset($arrRe[$pos])) && $arrRe[$pos] = array($pos);
                            (!in_array($obj->pos, $arrRe[$pos])) && array_push($arrRe[$pos], $obj->pos);
                        }
                    }
                }
            }
        }
        foreach ($arrRe as $pos => $arrTemp) {
            if (count($arrTemp) <= 2) {
                unset($arrRe[$pos]);
            }
        }
        return $arrRe;
    }
    
    public function getAroundInfo($zi) {
        $arrTemp = $this->arrPan[$zi->pos];
        $arrRe = array('friend' => array(), 'enemy' => array());
        foreach ($arrTemp as $pos) {
            if ($this->listPan[$pos]->team == $zi->team) {
                array_push($arrRe['friend'], $this->listPan[$pos]);
            } else {
                array_push($arrRe['enemy'], $this->listPan[$pos]);
            }
        }
        return $arrRe;
    }
    
    public function canBeMoved($zi) {
        $arrTemp = $this->arrPan[$zi->pos];
        $blnRe = false;
        foreach ($arrTemp as $pos) {
            if (!isset($this->listPan[$pos])) {
                $blnRe = true;
                break;
            }
        }
        return $blnRe;
    }
    
    public function __get($k) {
        return @$this->$k;
    }
    
    public function kill($zi) {
        if (is_object($zi) && 'zi' == get_class($zi)) {
            if ('A' == $zi->team) {
                unset($this->listA[$zi->sn]);
            } elseif ('B' == $zi->team) {
                unset($this->listB[$zi->sn]);
            }
            unset($this->listPan[$zi->pos]);
            array_push($this->arrKilled, $zi);
        } elseif (is_array($zi)) {
            foreach ($zi as $objTemp) {
                $this->kill($objTemp);
            }
        }
    }
    
    public function move($zi, $to) {
        $blnRe = false;
        if (is_object($zi) && 'zi' == get_class($zi)) {
            if (isset($this->arrPan[$to])) {
                if (in_array($to, $this->arrPan[$zi->pos])) {
                    if (isset($this->listPan[$zi->pos])) {
                        if (!isset($this->listPan[$to])) {
                            unset($this->listPan[$zi->pos]);
                            $zi->pos = $to;
                            $zi_ = new zi($zi->team, $zi->sn, $zi->pos);
                            $this->listPan[$to] = $zi_;
                            if ('A' == $zi->team) {
                                $this->listA[$zi->sn] = $zi_;
                            } elseif ('B' == $zi->team) {
                                $this->listB[$zi->sn] = $zi_;
                            }
                            $blnRe = true;
                        }
                    }
                }
            }
        }
        return $blnRe;
    }
}

class zi {
    private $team;
    private $sn;
    public $pos;
    public $color;
    
    public function __construct($t, $n, $p) {
        $this->team = $t;
        $this->color = ($t == 'A' ? 'red' : 'green');
        $this->sn = $n;
        $this->pos = $p;
    }
    
    public function __get($k) {
        return @$this->$k;
    }
}

function isDateStr($str) {
    $blnRe = false;
    $year = substr($str, 0, 4);
    $month = substr($str, 4, 2);
    $day = substr($str, 6, 2);
    if (checkdate($month, $day, $year)) {
        $hour = intval(substr($str, 8, 2));
        $minute = intval(substr($str, 10, 2));
        $second = intval(substr($str, 12, 2));
        if ($hour >= 0 && $hour <= 23) {
            if ($minute >= 0 && $hour <= 59) {
                if ($second >= 0 && $second <= 59) {
                    $str = $year . '-' . $month . '-' . $day . ' ' . $hour . ':' . $minute . ':' . $second;
                    $diff = time() - strtotime($str);
                    if ($diff > 0 && $diff < 300) {
                        $blnRe = true;
                    }
                }
            }
        }
    }
    return $blnRe;
}

$arrDo = array('init', 'move');
$arrRe = array();
$zis = null;
if (isset($_POST['do']) && in_array($_POST['do'], $arrDo)) {
    switch ($_POST['do']) {
        case 'init':
            $zis = new zis();
            $arrRe = $zis->listPan;
            $arrRe['data'] = $zis->genSimpleData('A');
            $arrRe['who'] = '<font color="red">红方走</font>';
            break;
        case 'move':
            $blnOk = false;
            if (isset($_POST['data']) && !empty($_POST['data'])) {
                $des = new des();
                $str = @$des->decode($_POST['data']);
                $dte = substr($str, 0, 14);
                if (!empty($str) && is_numeric($dte) && isDateStr($dte)) {
                    $who = substr($str, 14, 1);
                    $str = substr($str, 15);
                    $intLen = strlen($str) - 4;
                    $arrTemp = array();
                    for ($i = 0; $i <= $intLen; $i += 4) {
                        $arrTemp[substr($str, $i, 2)] = substr($str, ($i + 2), 2);
                    }
                    $zis = new zis(false);
                    if (false !== $zis->load($arrTemp)) {
                        $blnOk = true;
                        if (isset($_POST['from']) && !empty($_POST['from'])) {
                            if (isset($zis->listPan[$_POST['from']]) && $who == $zis->listPan[$_POST['from']]->team) {
                                if (isset($_POST['to']) && !empty($_POST['to'])) {
                                    if (false !== $zis->move($zis->listPan[$_POST['from']], $_POST['to'])) {
                                        $zis->analyze();
                                        $who = ($who == 'A' ? 'B' : 'A');
                                    }
                                }
                            }
                        }
                        if (count($zis->listA) <= 2) {
                            $arrRe['result'] = '绿方胜';
                        } elseif (count($zis->listB) <= 2) {
                            $arrRe['result'] = '红方胜';
                        } else {
                            $arrRe = $zis->listPan;
                            $arrRe['data'] = $zis->genSimpleData($who);
                            $arrRe['who'] = '<font color="' . ($who == 'A' ? 'red">红方走' : 'green">绿方走') . '</font>';
                        }
                    }
                }
            }
            if (!$blnOk) {
                $arrRe = array('error' => 'yes');
            }
            break;
    }
}
die(json_encode($arrRe));
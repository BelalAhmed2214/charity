<?php

namespace App;

enum UserRole: string
{
    case USER = 'user';
    case ADMIN = 'admin';
    case EDITOR = 'editor';
}
